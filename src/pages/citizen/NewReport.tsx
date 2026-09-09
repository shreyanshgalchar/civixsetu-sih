import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/AppShell";
import { IconMic, IconStop, IconPin, IconCamera, IconCheck, IconSpark, IconBolt } from "../../components/Icons";
import { analyze } from "../../lib/aiEngine";
import { AITriagePanel, DeptRanking } from "../../components/AITriage";
import { useSpeech, useStore, useCurrentUser } from "../../lib/hooks";
import { store } from "../../lib/store";
import { useToast } from "../../components/ui";

const WARDS = ["Banjara Hills", "Hitech City", "Gachibowli", "Kukatpally", "Madhapur", "Begumpet", "Ameerpet", "Secunderabad"];
const CITIES = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

export default function NewReport() {
  const nav = useNavigate();
  const user = useCurrentUser();
  const { push, node } = useToast();
  const speech = useSpeech();
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState("");
  const [city, setCity] = useState(user?.city || "Hyderabad");
  const [landmark, setLandmark] = useState("");
  const [myLat, setMyLat] = useState<number | undefined>();
  const [myLng, setMyLng] = useState<number | undefined>();
  const [gps, setGps] = useState<"idle" | "locating" | "done" | "err">("idle");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // live analysis (debounced)
  const analysis = useMemo(() => (text.trim().length >= 6 ? analyze(text) : null), [text]);

  const locate = () => {
    setGps("locating");
    if (!navigator.geolocation) { setGps("err"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLat(pos.coords.latitude); setMyLng(pos.coords.longitude);
        setLocation("GPS pin · " + pos.coords.latitude.toFixed(4) + ", " + pos.coords.longitude.toFixed(4));
        if (!ward) setWard(WARDS[Math.floor(Math.random() * WARDS.length)]);
        setGps("done");
        push("Location captured from GPS");
      },
      () => { setGps("err"); if (!ward) setWard(WARDS[Math.floor(Math.random() * WARDS.length)]); },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhotos((p) => [...p, String(reader.result)].slice(0, 4));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!analysis) { push("Describe the problem first", "err"); return; }
    setSubmitting(true);
    const rep = store.createReport({
      originalText: text,
      location: location || landmark || (analysis.entities.location || "Unspecified"),
      landmark: landmark || (analysis.entities.location || ""),
      ward: ward || user?.ward || "Banjara Hills",
      city: city || "Hyderabad",
      photo: photos.length ? photos : undefined,
      audio: undefined,
      lat: myLat, lng: myLng,
    });
    setTimeout(() => {
      setSubmitting(false);
      push(`Report ${rep.id} submitted · routed to ${rep.departmentName}`);
      nav(`/citizen/track/${rep.id}`);
    }, 900);
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <PageTitle eyebrow="New report · multilingual" title="Submit a civic issue" sub="Describe it in any language — Setu AI translates, routes and prioritizes. Department selection is fully automatic." />

      <div className="g2" style={{ gridTemplateColumns: "1.02fr .98fr", alignItems: "start", gap: 24 }}>
        {/* LEFT: input */}
        <div className="card card-glow" style={{ padding: 26 }}>
          <div className="field">
            <label>Describe the problem <span className="faint">· any language or dialect</span></label>
            <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)}
              placeholder="e.g. हमारे मोहल्ले की सड़क में तीन दिन से पानी नहीं आ रहा है…"
              style={{ minHeight: 150, fontSize: 15 }} />
            <div className="row gap-1 wrap mt-2">
              {speech.supported && (
                <button className="btn btn-outline btn-sm" onClick={() => (speech.listening ? speech.stop() : speech.start(lang, (t) => setText((p) => (p ? p + " " : "") + t)))} style={{ color: speech.listening ? "#fb7185" : "#22d3ee" }}>
                  {speech.listening ? <IconStop size={15} /> : <IconMic size={15} />} {speech.listening ? "Listening…" : "Speak"}
                </button>
              )}
              <select className="select" style={{ width: 130 }} value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en-IN">English</option><option value="hi-IN">हिन्दी</option><option value="te-IN">తెలుగు</option><option value="ta-IN">தமிழ்</option><option value="bn-IN">বাংলা</option><option value="mr-IN">मराठी</option><option value="gu-IN">ગુજરાતી</option><option value="kn-IN">ಕನ್ನಡ</option>
              </select>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFile} />
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}><IconCamera size={15} /> {photos.length ? `${photos.length} photo(s)` : "Photo"}</button>
            </div>
            {speech.interim && <div className="faint mono mt-1" style={{ fontSize: 12 }}>‹{speech.interim}›</div>}
            {photos.length > 0 && <div className="row gap-1 mt-2 wrap">{photos.map((p, i) => <span key={i} className="card" style={{ padding: 3, width: 64, height: 64, position: "relative" }}><img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9 }} /></span>)}</div>}
          </div>

          {/* localisation */}
          <div className="field">
            <label>Location & ward <span className="faint">· auto-detected</span></label>
            <div className="row gap-2 wrap">
              <div style={{ flex: 1, minWidth: 180 }} className="field" ><input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Street / landmark (auto-fills)" /></div>
              <button className="btn btn-ghost" onClick={locate}><IconPin size={16} style={{ color: gps === "done" ? "#6ee7b7" : "#fbbf24" }} /> {gps === "locating" ? "Locating…" : gps === "done" ? "GPS locked" : "Use GPS"}</button>
            </div>
            <div className="g2 mt-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <select className="select" value={ward} onChange={(e) => setWard(e.target.value)}><option value="">Ward (auto)</option>{WARDS.map((w) => <option key={w} value={w}>{w}</option>)}</select>
              <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
          </div>
        </div>

        {/* RIGHT: live AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {analysis ? (
            <AITriagePanel key={analysis.raw} analysis={analysis} onReset={() => setText("")} />
          ) : (
            <div className="card center" style={{ padding: "36px 22px" }}>
              <div className="kpi ic" style={{ margin: "0 auto 12px", background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}><IconSpark size={28} /></div>
              <div className="h-md">Setu AI is ready</div>
              <p className="muted" style={{ fontSize: 13.5, maxWidth: 320, margin: "0 auto" }}>Start typing — the AI triage analysis appears live as you write. No department dropdown: it's automatic.</p>
            </div>
          )}

          <button className="btn btn-primary btn-lg btn-block" onClick={submit} disabled={submitting || !analysis}>
            <IconBolt size={18} /> {submitting ? "Submitting…" : "Submit report"}
          </button>
          {!analysis && <div className="faint center" style={{ fontSize: 12 }}>Min. 6 characters to enable AI triage</div>}
        </div>
      </div>

      {analysis && <div className="mt-3"><DeptRanking analysis={analysis} /></div>}
      {node}
    </div>
  );
}
