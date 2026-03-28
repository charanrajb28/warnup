"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mic, Square, Zap, MessageSquare, Tag, List, AlertCircle,
  Clock, Download, Globe, Users, ShieldAlert, Phone, TrendingUp, ChevronRight
} from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import ConfidenceBar from "@/components/ConfidenceBar";
import { VoiceBridgeResult } from "@/types";
import { formatProcessingTime, getSeverityBadgeClass, getSeverityColor, capitalize } from "@/lib/utils";

const EMOTION_COLORS: Record<string, string> = {
  distressed: "#ef4444", anxious: "#f97316", angry: "#ef4444",
  urgent: "#f97316", confused: "#f59e0b", neutral: "#94a3b8",
  calm: "#10b981", hopeful: "#3b82f6",
};
const URGENCY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981",
};
const CATEGORY_ICONS: Record<string, string> = {
  medical: "🏥", legal: "⚖️", emergency: "🚨", administrative: "📋",
  "mental-health": "🧠", financial: "💰", social: "🤝", technical: "💻", other: "📌",
};

export default function VoiceBridgePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceBridgeResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recSeconds, setRecSeconds] = useState(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob); setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(); setMediaRecorder(mr); setRecording(true); setRecSeconds(0);
      const timer = setInterval(() => setRecSeconds(s => s + 1), 1000);
      mr.addEventListener("stop", () => clearInterval(timer));
    } catch { toast.error("Microphone access denied"); }
  };

  const stopRecording = () => { mediaRecorder?.stop(); setRecording(false); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleAnalyze = async () => {
    if (!text && !audioBlob) { toast.error("Provide text or record audio"); return; }
    setLoading(true); setResult(null);
    try {
      let body: Record<string, unknown> = { module: "voicebridge" };
      if (audioBlob) {
        const buf = await audioBlob.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        body = { ...body, fileData: b64, mimeType: "audio/webm", text: text || "Analyze this audio." };
      } else { body = { ...body, text }; }
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.result as VoiceBridgeResult);
      setProcessingTime(data.processingTime);
      toast.success("Voice analyzed");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
    a.download = "voicebridge-result.json"; a.click();
  };

  const SAMPLES = [
    "My mother is not waking up, she is breathing very slowly, she is diabetic 72 years old. We are near the big market near the railway station. Please help she has some medicines in her bag.",
    "Hello I'm calling about my father who was just told he has stage 3 kidney disease. He takes metformin for diabetes. The doctor said something about creatinine levels but we don't understand. We are very scared and don't know what to do next.",
  ];

  return (
    <ModuleLayout title="VoiceBridge" subtitle="Voice → Structured Intent" icon={Mic} color="#3b82f6" gradient="linear-gradient(135deg,#3b82f6,#8b5cf6)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mic size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>VoiceBridge</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Any voice, any language — get a dispatch-ready intent brief</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "360px 1fr" : "600px", gap: 20, justifyContent: result ? "unset" : "center" }}>
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Recorder */}
          <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 7 }}><Mic size={14} color="#3b82f6" /> Voice Recorder</h2>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 50, marginBottom: 16 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.div key={i} animate={recording ? { height: [4, Math.random() * 36 + 8, 4] } : { height: 4 }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
                    style={{ width: 3, borderRadius: 2, background: recording ? "#3b82f6" : "var(--border)" }}
                  />
                ))}
              </div>
              {recording && <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444", marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(recSeconds)}</div>}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {!recording
                  ? <button className="btn-primary" onClick={startRecording} style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}><Mic size={15} /> Start Recording</button>
                  : <button onClick={stopRecording} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, color: "#ef4444", fontWeight: 600, fontSize: 13, cursor: "pointer" }}><Square size={14} fill="#ef4444" /> Stop</button>
                }
              </div>
              {audioURL && !recording && (
                <div style={{ marginTop: 12 }}>
                  <audio controls src={audioURL} style={{ width: "100%", borderRadius: 6, filter: "invert(0.85) hue-rotate(180deg)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Text input */}
          <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}><MessageSquare size={14} color="#3b82f6" /> Or Paste Transcript / Text</h2>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste transcript, message, or any text to analyze for intent..."
              style={{ width: "100%", minHeight: 110, background: "rgba(5,8,16,0.5)", border: "1px solid var(--border)", borderRadius: 9, padding: "12px 14px", color: "var(--text-primary)", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginTop: 10, marginBottom: 7 }}>Quick Samples</p>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 11px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 5, lineHeight: 1.5, transition: "all 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(59,130,246,0.05)")}
              >{s.substring(0, 100)}…</button>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</> : <><Zap size={15} />Analyze Intent</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={13} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}><Clock size={10} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Critical flags */}
              {result.flags?.filter(f => f.severity === "critical" || f.severity === "high").length > 0 && (
                <div className="section-card pulse-red" style={{ borderColor: "rgba(239,68,68,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><AlertCircle size={15} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>⚠ Critical Flags</span></div>
                  {result.flags.filter(f => f.severity === "critical" || f.severity === "high").map((flag, i) => (
                    <div key={i} style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, padding: "10px 13px", marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, textTransform: "uppercase" }}>[{flag.type}]</span>
                        <span className={`badge ${getSeverityBadgeClass(flag.severity)}`}>{flag.severity}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{flag.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Intent Overview */}
              <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 30 }}>{CATEGORY_ICONS[result.intent.category] || "📌"}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Primary Intent</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{result.intent.primary}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                    <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${URGENCY_COLORS[result.intent.urgency] || "#94a3b8"}18`, color: URGENCY_COLORS[result.intent.urgency] || "#94a3b8", border: `1px solid ${URGENCY_COLORS[result.intent.urgency] || "#94a3b8"}40` }}>{result.intent.urgency.toUpperCase()} URGENCY</span>
                    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)" }}>{capitalize(result.intent.category)}</span>
                  </div>
                </div>
                {result.intent.secondary && result.intent.secondary.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {result.intent.secondary.map((s, i) => (
                      <span key={i} style={{ padding: "2px 9px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, fontSize: 11, color: "#8b5cf6" }}>{s}</span>
                    ))}
                  </div>
                )}
                {result.detectedLanguage && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                    <Globe size={12} color="#06b6d4" />
                    <span>Language: <strong>{result.detectedLanguage}</strong></span>
                    {result.intent.escalationTrigger && <span style={{ marginLeft: 8, padding: "2px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 100, fontSize: 11, color: "#ef4444", fontWeight: 700 }}>⚡ ESCALATE</span>}
                  </div>
                )}
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>{result.summary}</p>
                {result.executiveSummary && <p style={{ fontSize: 12, color: "#3b82f6", fontStyle: "italic", padding: "8px 12px", background: "rgba(59,130,246,0.05)", borderLeft: "2px solid #3b82f6", borderRadius: "0 6px 6px 0", marginBottom: 12 }}>{result.executiveSummary}</p>}
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Emotion Timeline */}
              {result.emotionTimeline && result.emotionTimeline.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><TrendingUp size={14} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Emotion Timeline</span></div>
                  <div style={{ position: "relative", paddingLeft: 24 }}>
                    <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 1, background: "var(--border)" }} />
                    {result.emotionTimeline.map((e, i) => (
                      <div key={i} style={{ position: "relative", marginBottom: 12 }}>
                        <div style={{ position: "absolute", left: -20, top: 4, width: 9, height: 9, borderRadius: "50%", background: EMOTION_COLORS[e.emotion] || "#94a3b8", border: "2px solid var(--bg-card)" }} />
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{e.timestamp}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: EMOTION_COLORS[e.emotion] || "#94a3b8", textTransform: "capitalize" }}>{e.emotion}</span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>({e.intensity} intensity)</span>
                        </div>
                        {e.trigger && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Trigger: &quot;{e.trigger}&quot;</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers */}
              {result.speakers && result.speakers.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Users size={14} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Speakers</span></div>
                  {result.speakers.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, marginBottom: 5 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#06b6d4" }}>{s.id}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{s.role}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>{s.wordCount} words</span>
                        <span>{Math.round(s.dominance * 100)}% dominance</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Entities */}
              {result.entities?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Tag size={14} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Extracted Entities</span></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {result.entities.map((entity, i) => (
                      <div key={i} title={entity.context} style={{ padding: "5px 11px", background: entity.sensitive ? "rgba(239,68,68,0.07)" : "rgba(6,182,212,0.07)", border: `1px solid ${entity.sensitive ? "rgba(239,68,68,0.25)" : "rgba(6,182,212,0.2)"}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 9, color: entity.sensitive ? "#ef4444" : "#06b6d4", fontWeight: 700, textTransform: "uppercase" }}>{entity.type}</span>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{entity.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {result.actionItems?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><List size={14} color="#f97316" /><span style={{ fontSize: 14, fontWeight: 600, color: "#f97316" }}>Action Items</span></div>
                  {result.actionItems.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 13px", background: `${getSeverityColor(item.priority)}0d`, border: `1px solid ${getSeverityColor(item.priority)}30`, borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: getSeverityColor(item.priority), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{item.action}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                          {item.assignedTo && <span>→ {item.assignedTo}</span>}
                          {item.department && <span style={{ marginLeft: 6 }}>({item.department})</span>}
                          {item.deadline && <span style={{ marginLeft: 6 }}>· {item.deadline}</span>}
                        </div>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(item.priority)}`}>{item.priority}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Compliance Flags */}
              {result.complianceFlags && result.complianceFlags.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><ShieldAlert size={14} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600 }}>Compliance Flags</span></div>
                  {result.complianceFlags.map((flag, i) => (
                    <div key={i} style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "10px 13px", marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>[{flag.type}]</span>
                        <span className={`badge ${getSeverityBadgeClass(flag.severity)}`}>{flag.severity}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{flag.description}</p>
                      <p style={{ fontSize: 11, color: "#f59e0b" }}>→ {flag.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CRM Fields */}
              {result.crmFields && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Phone size={14} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>CRM / Dispatch Record</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {[
                      { label: "Contact Reason", val: result.crmFields.contactReason },
                      { label: "Priority", val: result.crmFields.priority },
                      { label: "Case Category", val: result.crmFields.caseCategory },
                      { label: "Suggested Queue", val: result.crmFields.suggestedQueue },
                      { label: "Resolution", val: result.crmFields.resolutionStatus },
                      { label: "Disposition", val: result.crmFields.callDisposition },
                    ].map(item => (
                      <div key={item.label} style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, padding: "8px 11px" }}>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                  {result.crmFields.followUpRequired && (
                    <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, fontSize: 12, color: "#3b82f6" }}>
                      📅 Follow-up required{result.crmFields.followUpDate ? `: ${result.crmFields.followUpDate}` : ""}
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Response */}
              {result.suggestedResponse && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><MessageSquare size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Suggested Response to Caller</span></div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, padding: "10px 14px", background: "rgba(16,185,129,0.05)", borderLeft: "3px solid #10b981", borderRadius: "0 8px 8px 0", fontStyle: "italic" }}>&quot;{result.suggestedResponse}&quot;</p>
                </div>
              )}

              {/* Escalation + Key Facts */}
              {result.escalationPath && result.escalationPath.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><ChevronRight size={14} color="#f97316" /><span style={{ fontSize: 14, fontWeight: 600 }}>Escalation Path</span></div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {result.escalationPath.map((step, i) => (
                      <span key={i} style={{ padding: "4px 12px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 100, fontSize: 12, color: "#f97316", fontWeight: 600 }}>{step}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
