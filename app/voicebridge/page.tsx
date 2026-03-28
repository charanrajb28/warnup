"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mic, MicOff, Square, Play, Zap, MessageSquare,
  Tag, List, AlertCircle, Clock, Globe, Download, Sparkles
} from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import ConfidenceBar from "@/components/ConfidenceBar";
import { VoiceBridgeResult } from "@/types";
import { formatProcessingTime, getSeverityBadgeClass, capitalize } from "@/lib/utils";

const URGENCY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981",
};
const SENTIMENT_COLORS: Record<string, string> = {
  distressed: "#ef4444", urgent: "#f97316", negative: "#f59e0b",
  neutral: "#94a3b8", positive: "#10b981",
};
const CATEGORY_ICONS: Record<string, string> = {
  medical: "🏥", legal: "⚖️", emergency: "🚨", administrative: "📋",
  personal: "👤", social: "🤝", technical: "💻", other: "📌",
};

export default function VoiceBridgePage() {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceBridgeResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleAnalyze = async () => {
    if (!text && !audioBlob) { toast.error("Please provide text or record audio"); return; }
    setLoading(true); setResult(null);
    try {
      let body: Record<string, unknown> = { module: "voicebridge" };
      if (audioBlob) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        body = { ...body, fileData: base64, mimeType: "audio/webm", text: text || "Analyze this audio recording." };
      } else {
        body = { ...body, text };
      }
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result as VoiceBridgeResult);
      setProcessingTime(data.processingTime);
      toast.success("Voice analyzed successfully!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "voicebridge-result.json"; a.click();
  };

  return (
    <ModuleLayout title="VoiceBridge" subtitle="Voice → Structured Intent" icon={Mic} color="#3b82f6" gradient="linear-gradient(135deg,#3b82f6,#8b5cf6)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mic size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>VoiceBridge</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Record voice or paste text — get full structured intent analysis</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 24 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          {/* Voice Recorder */}
          <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.2)", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Mic size={15} color="#3b82f6" /> Voice Recorder
            </h2>
            <div style={{ textAlign: "center" }}>
              {/* Waveform visual */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 60, marginBottom: 20 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div key={i}
                    animate={recording ? { height: [8, Math.random() * 40 + 10, 8] } : { height: 8 }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                    style={{ width: 4, borderRadius: 2, background: recording ? "var(--accent-blue)" : "var(--border)" }}
                  />
                ))}
              </div>

              {recording && (
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: "#ef4444", marginBottom: 12 }}>
                  {formatTime(recordSeconds)}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {!recording ? (
                  <button className="btn-primary" onClick={startRecording} style={{ gap: 8 }}>
                    <Mic size={16} /> Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, color: "#ef4444", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    <Square size={16} fill="#ef4444" /> Stop Recording
                  </button>
                )}
              </div>

              {audioURL && !recording && (
                <div style={{ marginTop: 16 }}>
                  <audio controls src={audioURL} style={{ width: "100%", borderRadius: 8, filter: "invert(0.8) hue-rotate(180deg)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Text input */}
          <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={15} color="#3b82f6" /> Or Paste Transcript / Text
            </h2>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste voice transcription, a message, description of a situation, or any text you want analyzed for intent..."
              style={{ width: "100%", minHeight: 130, background: "rgba(5,8,16,0.5)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", color: "var(--text-primary)", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            {/* Sample prompts */}
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>QUICK SAMPLES:</p>
              {[
                "I'm having severe chest pain for the last 30 minutes and my left arm feels numb. I'm 55 years old and take blood pressure medication.",
                "Hello I need to speak with someone urgently about my mother who was just diagnosed with stage 3 cancer. We don't know what to do next.",
              ].map((sample, i) => (
                <button key={i} onClick={() => setText(sample)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 6, lineHeight: 1.5, transition: "all 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(59,130,246,0.05)")}
                >
                  {sample.substring(0, 95)}…
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Zap size={16} /> Analyze Intent</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={14} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}><Clock size={11} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Intent summary */}
              <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 28 }}>{CATEGORY_ICONS[result.intent.category] || "📌"}</span>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>Primary Intent</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{result.intent.primary}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <span className={`badge ${getSeverityBadgeClass(result.intent.urgency)}`}>{result.intent.urgency} urgency</span>
                    <span style={{ padding: "3px 10px", borderRadius: 100, background: `${SENTIMENT_COLORS[result.intent.sentiment]}22`, color: SENTIMENT_COLORS[result.intent.sentiment], border: `1px solid ${SENTIMENT_COLORS[result.intent.sentiment]}44`, fontWeight: 600, fontSize: 11 }}>
                      {result.intent.sentiment}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
                    {capitalize(result.intent.category)}
                  </span>
                  <span style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
                    <Globe size={10} style={{ display: "inline", marginRight: 4 }} />{result.detectedLanguage}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{result.summary}</p>
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Transcription */}
              {result.transcription && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MessageSquare size={15} color="#3b82f6" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Transcription</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, fontStyle: "italic", padding: "12px 16px", background: "rgba(59,130,246,0.04)", borderLeft: "3px solid #3b82f6", borderRadius: "0 8px 8px 0" }}>
                    "{result.transcription}"
                  </p>
                </div>
              )}

              {/* Action Items */}
              {result.actionItems?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <List size={15} color="#8b5cf6" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Action Items</span>
                  </div>
                  {result.actionItems.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.action}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                          {item.assignedTo !== "user" && `Assigned to: ${item.assignedTo} · `}
                          {item.deadline && `Due: ${item.deadline}`}
                        </div>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(item.priority)}`}>{item.priority}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Entities */}
              {result.entities?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Tag size={15} color="#06b6d4" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Extracted Entities</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.entities.map((entity, i) => (
                      <div key={i} title={entity.context} style={{ padding: "6px 12px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#06b6d4", fontWeight: 700, textTransform: "uppercase" }}>{entity.type}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{entity.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Facts */}
              {result.keyFacts?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Sparkles size={15} color="#f59e0b" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Key Facts</span>
                  </div>
                  {result.keyFacts.map((fact, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < result.keyFacts.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>·</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{fact}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Response */}
              {result.suggestedResponse && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MessageSquare size={15} color="#10b981" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Suggested Response</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{result.suggestedResponse}</p>
                </div>
              )}

              {/* Flags */}
              {result.flags?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <AlertCircle size={15} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>Flags</span>
                  </div>
                  {result.flags.map((flag, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, textTransform: "uppercase" }}>[{flag.type}]</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 8 }}>{flag.description}</span>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(flag.severity)}`}>{flag.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
