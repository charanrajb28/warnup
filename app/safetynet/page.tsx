"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ShieldAlert, Zap, MapPin, Users, AlertTriangle, Phone, Clock, Radio, Download, Activity, Siren } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import ConfidenceBar from "@/components/ConfidenceBar";
import { SafetyNetResult } from "@/types";
import { getSeverityColor, getSeverityBadgeClass, formatProcessingTime, capitalize } from "@/lib/utils";

const EMERGENCY_ICONS: Record<string, string> = {
  medical: "🏥", fire: "🔥", security: "🔒", natural_disaster: "🌪️",
  mental_health: "🧠", domestic: "🏠", missing_person: "🔍", accident: "🚗", other: "⚠️",
};
const AGENCY_COLORS: Record<string, string> = {
  police: "#3b82f6", fire: "#ef4444", ems: "#10b981",
  coastguard: "#06b6d4", mental_health: "#8b5cf6",
  social_services: "#f59e0b", other: "#94a3b8",
};
const TIMEFRAME_ORDER = ["immediate", "within_5min", "within_15min", "within_1hr"];

export default function SafetyNetPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyNetResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error("Please describe the emergency or safety situation"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: "safetynet", text }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result as SafetyNetResult);
      setProcessingTime(data.processingTime);
      toast.success("Emergency plan generated!");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "safetynet-result.json"; a.click();
  };

  const severityIsHigh = result && ["high", "critical", "life_threatening"].includes(result.severity);

  return (
    <ModuleLayout title="SafetyNet" subtitle="Emergency Response Coordinator" icon={ShieldAlert} color="#f59e0b" gradient="linear-gradient(135deg,#f59e0b,#ef4444)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>SafetyNet</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Describe any emergency — get a complete, prioritized response action plan</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 24 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="section-card" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Siren size={15} color="#f59e0b" /> Emergency Description</h2>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Describe the emergency situation in detail: what happened, where, who is involved, any known injuries, immediate dangers...

Example: 'There's been a car accident on Highway 45 near Exit 12. Two vehicles involved. One person appears unconscious and trapped. Fuel leaking from one car. About 6 other people standing around, some injured.'"
              style={{ width: "100%", minHeight: 220, background: "rgba(5,8,16,0.5)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", color: "var(--text-primary)", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Generating Plan...</> : <><Zap size={16} /> Generate Response Plan</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={14} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}><Clock size={11} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>

          {/* Sample scenarios */}
          <div className="section-card" style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Sample Scenarios</p>
            {[
              "Elderly woman found unconscious at home by neighbor. Not breathing normally. No known medical history available. Address: 45 Oak Street, 3rd floor.",
              "Large fire reported in apartment building at 123 Main Street. Residents visible on balconies on floors 4-6. Fire spreading from 2nd floor. About 50 residents in building.",
              "Person calling in distress, crying, says they can't go on anymore. Won't give location. Has been talking for 10 minutes. Mentions being home alone.",
            ].map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 6, lineHeight: 1.5, transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,158,11,0.05)")}
              >{s.substring(0, 100)}…</button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Emergency header */}
              <div className={`section-card ${severityIsHigh ? "pulse-red" : ""}`} style={{ borderColor: `${getSeverityColor(result.severity)}55`, background: `${getSeverityColor(result.severity)}08` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 36 }}>{EMERGENCY_ICONS[result.emergencyType] || "⚠️"}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>EMERGENCY TYPE</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: getSeverityColor(result.severity) }}>{capitalize(result.emergencyType)}</div>
                    </div>
                  </div>
                  <span className={`badge ${getSeverityBadgeClass(result.severity)}`} style={{ fontSize: 13, padding: "5px 14px" }}>
                    {result.severity.toUpperCase().replace(/_/g, " ")}
                  </span>
                </div>

                <div style={{ padding: "12px 16px", background: `${getSeverityColor(result.severity)}12`, border: `1px solid ${getSeverityColor(result.severity)}33`, borderRadius: 10, marginBottom: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: getSeverityColor(result.severity), lineHeight: 1.6 }}>{result.summary}</p>
                </div>

                {result.location.described !== "Not specified" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                    <MapPin size={14} color="#f59e0b" />
                    <span>{result.location.described}</span>
                    {result.location.landmarks.length > 0 && <span style={{ color: "var(--text-muted)" }}>· Near: {result.location.landmarks.join(", ")}</span>}
                  </div>
                )}

                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Response Actions - sorted by priority */}
              {result.responseActions?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Activity size={15} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>Response Actions</span></div>
                  {[...result.responseActions]
                    .sort((a, b) => TIMEFRAME_ORDER.indexOf(a.timeFrame) - TIMEFRAME_ORDER.indexOf(b.timeFrame))
                    .map((action, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: `${AGENCY_COLORS[action.agency] || "#94a3b8"}10`, border: `1px solid ${AGENCY_COLORS[action.agency] || "#94a3b8"}30`, borderRadius: 9, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: AGENCY_COLORS[action.agency] || "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>{action.priority}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{action.action}</div>
                          <div style={{ fontSize: 11, marginTop: 4, display: "flex", gap: 10 }}>
                            <span style={{ color: AGENCY_COLORS[action.agency] || "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{action.agency}</span>
                            <span style={{ color: "var(--text-muted)" }}>· {action.timeFrame.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Immediate Risks */}
              {result.immediateRisks?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><AlertTriangle size={15} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600 }}>Immediate Risks</span></div>
                  {result.immediateRisks.map((risk, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{risk.risk}</span>
                        <span className={`badge ${getSeverityBadgeClass(risk.probability)}`}>{risk.probability} prob.</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Mitigation: {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Persons Involved */}
              {result.personsInvolved?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Users size={15} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Persons Involved</span></div>
                  {result.personsInvolved.map((p, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "10px 14px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 700, textTransform: "uppercase", background: "rgba(139,92,246,0.1)", padding: "3px 8px", borderRadius: 4 }}>{p.role}</span>
                      <span style={{ fontSize: 13 }}>{p.description}</span>
                      {p.condition && <span style={{ fontSize: 12, color: getSeverityColor(p.condition.includes("critical") || p.condition.includes("unconscious") ? "critical" : p.condition.includes("injured") ? "medium" : "low") }}>{p.condition}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Resources Needed */}
              {result.resourcesNeeded?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Radio size={15} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Resources Required</span></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.resourcesNeeded.map((r, i) => (
                      <span key={i} style={{ padding: "6px 14px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, fontSize: 13, color: "#06b6d4" }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication Protocol */}
              {result.communicationProtocol && (
                <div className="section-card" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Phone size={15} color="#3b82f6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Communication Protocol</span></div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>NOTIFY AGENCIES:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.communicationProtocol.notifyAgencies.map((agency, i) => (
                        <span key={i} style={{ padding: "4px 12px", background: `${AGENCY_COLORS[agency.toLowerCase()] || "#94a3b8"}15`, border: `1px solid ${AGENCY_COLORS[agency.toLowerCase()] || "#94a3b8"}40`, borderRadius: 100, fontSize: 12, color: AGENCY_COLORS[agency.toLowerCase()] || "#94a3b8", fontWeight: 600 }}>{agency}</span>
                      ))}
                    </div>
                  </div>
                  {result.communicationProtocol.publicAlert && (
                    <div style={{ padding: "8px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 10 }}>
                      🔔 Public Alert Recommended
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{result.communicationProtocol.mediaGuidance}</p>
                </div>
              )}

              {/* Timeline */}
              {result.timeline?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Clock size={15} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Response Timeline</span></div>
                  <div style={{ position: "relative", paddingLeft: 28 }}>
                    <div style={{ position: "absolute", left: 10, top: 6, bottom: 6, width: 1, background: "var(--border)" }} />
                    {result.timeline.map((t, i) => (
                      <div key={i} style={{ position: "relative", marginBottom: 16 }}>
                        <div style={{ position: "absolute", left: -23, top: 3, width: 10, height: 10, borderRadius: "50%", background: t.status === "completed" ? "#10b981" : t.status === "in_progress" ? "#f59e0b" : "#475569", border: "2px solid var(--bg-card)" }} />
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>{t.time}</div>
                        <div style={{ fontSize: 13 }}>{t.action}</div>
                        <div style={{ fontSize: 11, padding: "2px 8px", background: t.status === "completed" ? "rgba(16,185,129,0.1)" : t.status === "in_progress" ? "rgba(245,158,11,0.1)" : "rgba(71,85,105,0.2)", color: t.status === "completed" ? "#10b981" : t.status === "in_progress" ? "#f59e0b" : "#475569", borderRadius: 100, display: "inline-block", marginTop: 4 }}>{t.status.replace(/_/g, " ")}</div>
                      </div>
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
