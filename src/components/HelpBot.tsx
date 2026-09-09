import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askBot, type BotMessage } from "../lib/helpbot";
import { store, botFeedbackLog } from "../lib/store";
import { Logo } from "./Logo";
import { IconX, IconSend, IconSpark, IconCheck } from "./Icons";

const QUICK = ["How do I report a pothole?", "Which department handles water?", "Tell me about the AI", "What is karma?", "Track my report"];

export default function HelpBot({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(true);
  const [msgs, setMsgs] = useState<BotMessage[]>([
    { id: "b1", from: "bot", text: "Namaste! 👋 I'm **Setu**, your civic assistant. Ask me anything about reporting, tracking, departments, or the AI — or type below.", ts: Date.now(), suggestions: QUICK.slice(0, 3) },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [fb, setFb] = useState<Record<string, boolean | undefined>>({});

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  const link = (to: string) => { onClose(); nav(to); };

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput("");
    setMsgs((m) => [...m, { id: "u" + Date.now(), from: "user", text, ts: Date.now() }]);
    setTyping(true);
    setTimeout(() => {
      const a = askBot(text);
      setMsgs((m) => [...m, { id: "b" + Date.now(), from: "bot", text: a.text, ts: Date.now(), actions: a.actions, suggestions: a.suggestions, confidence: a.confidence }]);
      setTyping(false);
    }, 620);
  };

  const rate = (id: string, liked: boolean) => {
    const msg = msgs.find((m) => m.id === id);
    if (!msg || msg.from !== "bot") return;
    store.addBotFeedback(msg.text, liked ? "helpful" : "unhelpful", liked);
    setFb((f) => ({ ...f, [id]: liked }));
  };

  const renderText = (t: string) => {
    // tiny markdown: bold
    const parts = t.split("**");
    return parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>));
  };

  return (
    <div style={{ position: "fixed", right: 22, bottom: 22, zIndex: 200, display: "flex", flexDirection: "column", gap: 12 }}>
      {open && (
        <div className="card card-glow anim-pop" style={{ width: 380, maxWidth: "calc(100vw - 44px)", height: 540, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", background: "rgba(10,16,31,0.96)" }}>
          {/* header */}
          <div className="row gap-2" style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "radial-gradient(60% 120% at 0% 0%, rgba(34,211,238,0.18), transparent)" }}>
            <div className="avatar-chip" style={{ borderRadius: 13, background: "rgba(139,92,246,0.16)", display: "grid", placeItems: "center", width: 40, height: 40 }}><Logo size={30} /></div>
            <div>
              <div className="row gap-1" style={{ fontWeight: 700 }}>Setu AI <span className="chip st-RESOLVED"><span className="dot" style={{ width: 6, height: 6, background: "#34d399", display: "inline-block", borderRadius: 50, marginRight: 5, animation: "pulse 2s infinite" }} /> online</span></div>
              <div className="faint" style={{ fontSize: 11.5 }}>HelpBot · multilingual · offline engine</div>
            </div>
            <button className="btn btn-ghost btn-sm right" onClick={() => setOpen(false)}><IconX size={16} /></button>
          </div>

          {/* messages */}
          <div ref={listRef} className="card" style={{ flex: 1, overflowY: "auto", borderRadius: 0, border: "none", padding: 16, background: "transparent", display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.map((m) => m.from === "bot" ? (
              <div key={m.id} style={{ maxWidth: "88%" }}>
                <div className="card" style={{ padding: "11px 13px", borderRadius: 16, borderTopLeftRadius: 4, background: "rgba(16,24,40,0.8)", fontSize: 13.5, lineHeight: 1.5 }}>{renderText(m.text)}</div>
                {/* feedback */}
                <div className="row gap-1" style={{ marginTop: 6 }}>
                  <span className="faint" style={{ fontSize: 11 }}>Was this helpful?</span>
                  <button className="btn btn-ghost" style={{ width: 24, height: 24, padding: 0 }} onClick={() => rate(m.id, true)} title="Helpful">{fb[m.id] === true ? <IconCheck size={13} style={{ color: "#6ee7b7" }} /> : "👍"}</button>
                  <button className="btn btn-ghost" style={{ width: 24, height: 24, padding: 0 }} onClick={() => rate(m.id, false)} title="Not helpful">{fb[m.id] === false ? <IconX size={13} style={{ color: "#fb7185" }} /> : "👎"}</button>
                </div>
                {/* actions */}
                {m.actions && <div className="row gap-1 wrap" style={{ marginTop: 8 }}>{m.actions.map((a) => <button key={a.link + a.label} className="btn btn-primary btn-sm" onClick={() => link(a.link)}>{a.label}</button>)}</div>}
                {/* suggestions */}
                {m.suggestions && <div className="row gap-1 wrap" style={{ marginTop: 8 }}>{m.suggestions.map((s) => <button key={s} className="btn btn-outline btn-sm" onClick={() => send(s)}>{s}</button>)}</div>}
              </div>
            ) : (
              <div key={m.id} className="card" style={{ alignSelf: "flex-end", maxWidth: "85%", padding: "11px 13px", borderRadius: 16, borderBottomRightRadius: 4, background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(52,211,153,0.18))", fontSize: 13.5 }}>{m.text}</div>
            ))}
            {typing && <div className="card" style={{ width: "auto", padding: "10px 14px", borderRadius: 16, borderTopLeftRadius: 4, background: "rgba(16,24,40,0.8)" }}><span className="faint" style={{ fontSize: 13 }}>Setu is typing<span className="caret" /></span></div>}
          </div>

          {/* quick chips */}
          <div className="row gap-1 wrap" style={{ padding: "10px 14px 0" }}>
            {QUICK.slice(0, 3).map((q) => <button key={q} className="btn btn-ghost btn-sm" onClick={() => send(q)}>{q}</button>)}
          </div>

          {/* input */}
          <div className="row gap-1" style={{ padding: 12 }}>
            <input className="input" style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask Setu anything…" />
            <button className="btn btn-primary" style={{ width: 46, padding: 0 }} onClick={() => send()}><IconSend size={18} /></button>
          </div>
        </div>
      )}

      {/* launcher */}
      <button className="btn btn-primary btn-lg" style={{ borderRadius: 999, boxShadow: "var(--shadow-brand)", alignSelf: "flex-end", width: 58, height: 58, padding: 0, fontSize: 24 }} onClick={() => setOpen(!open)}>
        {open ? <IconX size={22} /> : <IconSpark size={24} />}
      </button>
    </div>
  );
}
