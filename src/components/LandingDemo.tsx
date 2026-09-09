import { useMemo, useState } from "react";
import { analyze } from "../lib/aiEngine";
import { AITriagePanel, DeptRanking } from "./AITriage";
import { IconMic, IconStop, IconSpark, IconChevR } from "./Icons";
import { useSpeech } from "../lib/hooks";

const SAMPLES = [
  { label: "हिन्दी", text: "हमारे मोहल्ले की सड़क में तीन दिन से पानी नहीं आ रहा है। बुजुर्ग सबसे ज्यादा परेशान हैं, कृपया जल्द कार्रवाई करें।" },
  { label: "తెలుగు", text: "మా వీధిలో వీధి దీపాలు ఆరు రోజులుగా పని చేయడం లేదు, రాత్రి చాలా చీకటిగా ఉంది. పిల్లలు భయపడుతున్నారు." },
  { label: "Hinglish", text: "sadak mein gaddha bahut bada hai, gaadiyan theek se nahi chal rahi. kachra bhi bahut ganda hai." },
  { label: "தமிழ்", text: "எங்கள் தெருவில் குப்பை மூன்று நாட்களாக அகற்றப்படவில்லை, நாற்றம் அதிகமாக உள்ளது." },
  { label: "English", text: "Six streetlights on our lane have been dead for a week. Dark and unsafe after 8pm, near the school crossing." },
];

export function LandingDemo({ compact }: { compact?: boolean }) {
  const [text, setText] = useState(SAMPLES[0].text);
  const [lang, setLang] = useState<string>(() => (typeof window !== "undefined" && "webkitSpeechRecognition" in window ? "en-IN" : "en-IN"));
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyze> | null>(null);
  const [running, setRunning] = useState(false);
  const speech = useSpeech();

  const run = (t: string) => {
    if (!t.trim()) return;
    setRunning(true);
    setTimeout(() => { setAnalysis(analyze(t)); setRunning(false); }, 100);
  };

  const cur = useMemo(() => {
    if (!analysis) return null;
    return analysis;
  }, [analysis]);

  return (
    <div className="card card-glow" style={{ padding: "26px" }}>
      <div className="row-between wrap gap-2 mb-3">
        <div className="row gap-2">
          <div className="kpi ic" style={{ background: "rgba(139,92,246,0.14)", color: "#c4b5fd" }}><IconSpark size={24} /></div>
          <div>
            <div className="h-md">Try Setu AI</div>
            <div className="faint" style={{ fontSize: 12 }}>Type in any language or dialect — see the English summary + auto-routing instantly.</div>
          </div>
        </div>
        <span className="chip st-RESOLVED"><span className="dot" style={{ width: 6, height: 6, background: "#34d399", display: "inline-block", borderRadius: 50, marginRight: 6, animation: "pulse 2s infinite" }} /> 12 languages · offline</span>
      </div>

      {/* samples */}
      <div className="row gap-1 wrap mb-3">
        {SAMPLES.map((s) => (
          <button key={s.label} className="btn btn-ghost btn-sm" onClick={() => { setText(s.text); setAnalysis(null); }}>{s.label}</button>
        ))}
      </div>

      {/* input */}
      <div style={{ position: "relative" }}>
        <textarea
          className="textarea" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Describe the civic problem in any language…"
          style={{ minHeight: 96, fontSize: 15, lineHeight: 1.6 }}
        />
        <div className="row gap-1 mt-2 wrap">
          {speech.supported && (
            <button className="btn btn-outline btn-sm" onClick={() => (speech.listening ? speech.stop() : speech.start("en-IN", (t) => setText((p) => (p ? p + " " : "") + t)))} style={{ color: speech.listening ? "#fb7185" : "#22d3ee" }}>
              {speech.listening ? <IconStop size={15} /> : <IconMic size={15} />} {speech.listening ? "Listening…" : "Record voice"}
            </button>
          )}
          <select className="select" style={{ width: 120 }} value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en-IN">English</option><option value="hi-IN">हिन्दी</option><option value="te-IN">తెలుగు</option><option value="ta-IN">தமிழ்</option><option value="bn-IN">বাংলা</option><option value="mr-IN">मराठी</option><option value="gu-IN">ગુજરાતી</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => run(text)} disabled={running || !text.trim()}><IconSpark size={15} /> {running ? "Analyzing…" : "Analyze with Setu AI"}</button>
          {analysis && <button className="btn btn-ghost btn-sm" onClick={() => setAnalysis(null)}>Clear</button>}
        </div>
      </div>

      {speech.interim && <div className="faint mono mt-1" style={{ fontSize: 12 }}>‹{speech.interim}›</div>}

      {cur ? (
        <>
          <div className="divider" style={{ margin: "20px 0" }} />
          <AITriagePanel analysis={cur} onReset={() => setAnalysis(null)} />
          <div className="mt-2"><DeptRanking analysis={cur} /></div>
        </>
      ) : (
        <div className="mt-3 center faint" style={{ fontSize: 13, padding: "18px 0" }}>
          <IconChevR size={16} style={{ display: "inline", verticalAlign: "middle", transform: "rotate(90deg)" }} /> Select a sample or type your own to see the full AI pipeline
        </div>
      )}
    </div>
  );
}
