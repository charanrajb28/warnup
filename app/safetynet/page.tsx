"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { AlertOctagon, Zap, MapPin, AlertTriangle, Clock, Radio, Flame, Briefcase, Download, Crosshair } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import InputZone from "@/components/InputZone";
import ConfidenceBar from "@/components/ConfidenceBar";
import FollowUpChat from "@/components/FollowUpChat";
import { SafetyNetResult } from "@/types";
import { fileToBase64, getSeverityBadgeClass, getSeverityColor, formatProcessingTime } from "@/lib/utils";

const TRIAGE_COLORS: Record<string, string> = { Red: "#ef4444", Yellow: "#f59e0b", Green: "#10b981", Black: "#1e293b", Unknown: "#94a3b8" };

export default function SafetyNetPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyNetResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text && !file) { toast.error("Provide an emergency description or upload a photo"); return; }
    setLoading(true); setResult(null);
    try {
      let fileData: string | undefined, mimeType: string | undefined;
      if (file) { fileData = await fileToBase64(file); mimeType = file.type; }
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: "safetynet", text: text || undefined, fileData, mimeType }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.result as SafetyNetResult);
      setProcessingTime(data.processingTime);
      toast.success("Response plan generated");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })); a.download = "safetynet-ics201.json"; a.click();
  };

  const SAMPLES = [
    "Large fire reported in apartment building at 123 Main Street. Residents visible on balconies on floors 4-6. Fire spreading from 2nd floor. About 50 residents in building. Smell of gas reported by bystanders.",
    "Multiple vehicle collision on I-95 Northbound near Exit 42. At least 4 cars and 1 semi-truck involved. Truck is leaking unknown green fluid. Several people trapped in cars. Traffic completely stopped.",
  ];

  return (
    <ModuleLayout title="SafetyNet" subtitle="Emergency Management" icon={AlertOctagon} color="#f59e0b" gradient="linear-gradient(135deg,#f59e0b,#ef4444)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertOctagon size={26} color="white" /></div>
          <div><h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>SafetyNet</h1><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Chaotic emergency report → Command-ready ICS-201 Incident Brief instantly</p></div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "360px 1fr" : "600px", gap: 20, justifyContent: result ? "unset" : "center" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-card" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}><Radio size={14} color="#f59e0b" /> Incident Report Input</h2>
            <InputZone onTextChange={setText} onFileChange={setFile} placeholder="Describe the emergency, or upload a photo of the scene..." acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg"] }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>{loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Generating Plan...</> : <><Zap size={15} />Generate Plan</>}</button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={13} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}><Clock size={10} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>
          <div className="section-card">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Try a Sample</p>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 11px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 5, lineHeight: 1.5, transition: "all 0.18s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,158,11,0.05)")}>{s.substring(0, 100)}…</button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Immediate Risks (Critical Flags) */}
              {result.immediateRisks?.length > 0 && (
                <div className="section-card pulse-red" style={{ borderColor: "rgba(239,68,68,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><AlertTriangle size={15} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>⚠ Immediate Hazards & Risks</span></div>
                  {result.immediateRisks.map((risk, i) => (
                    <div key={i} style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 9, padding: "10px 14px", marginBottom: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{risk.risk}</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          {risk.timeframe && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{risk.timeframe}</span>}
                          <span className={`badge ${getSeverityBadgeClass(risk.probability === "high" ? "critical" : risk.probability)}`}>{risk.probability} Prob.</span>
                        </div>
                      </div>
                      {risk.impact && <p style={{ fontSize: 12, color: "#f97316", marginBottom: 4 }}>Impact: {risk.impact}</p>}
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>→ Mitigation: {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Incident Brief (Overview) */}
              <div className="section-card" style={{ borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{result.incidentId || "INCIDENT BRIEF"}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{result.emergencyType}</div>
                    {result.emergencySubtype && <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{result.emergencySubtype}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className={`badge ${getSeverityBadgeClass(result.severity)}`} style={{ padding: "4px 12px", fontSize: 13 }}>LEVEL: {result.severity.toUpperCase()}</span>
                    {result.icsLevel && <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", padding: "2px 8px", borderRadius: 100 }}>{result.icsLevel}</span>}
                  </div>
                </div>

                {/* Location */}
                <div style={{ background: "rgba(5,8,16,0.5)", borderRadius: 8, padding: "10px 14px", marginBottom: 12, borderLeft: "3px solid #f97316" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><MapPin size={12} color="#f97316" /><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>LOCATION</span></div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{result.location.described}</div>
                  {result.location.landmarks.length > 0 && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>Landmarks: {result.location.landmarks.join(", ")}</div>}
                </div>

                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>{result.summary}</p>
                {result.commandBrief && <p style={{ fontSize: 12, color: "#f59e0b", fontStyle: "italic", padding: "8px 12px", background: "rgba(245,158,11,0.05)", borderLeft: "2px solid #f59e0b", borderRadius: "0 6px 6px 0", marginBottom: 12 }}>{result.commandBrief}</p>}
                
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Response Actions (Priority) */}
              {result.responseActions?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Zap size={15} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Prioritized Response Actions</span></div>
                  {result.responseActions.map((action, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 13px", background: `${getSeverityColor(action.priority === 1 ? "critical" : action.priority === 2 ? "high" : "medium")}0d`, border: `1px solid ${getSeverityColor(action.priority === 1 ? "critical" : action.priority === 2 ? "high" : "medium")}30`, borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: getSeverityColor(action.priority === 1 ? "critical" : action.priority === 2 ? "high" : "medium"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>{action.priority}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: action.priority === 1 ? 600 : 400 }}>{action.action}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{action.agency}</span>
                          {action.timeFrame && <span style={{ marginLeft: 6 }}>· {action.timeFrame}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Casualty & Triage */}
              {(result.casualtyAssessment || result.triageProtocol) && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Crosshair size={15} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 600 }}>Triage & Casualties</span></div>
                  
                  {result.casualtyAssessment?.estimated && (
                    <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(5,8,16,0.5)", borderRadius: 9, padding: "12px 16px", marginBottom: 12 }}>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total</div><div style={{ fontSize: 20, fontWeight: 800 }}>{result.casualtyAssessment.estimated.total}</div></div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Critical</div><div style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>{result.casualtyAssessment.estimated.critical}</div></div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Serious</div><div style={{ fontSize: 20, fontWeight: 800, color: "#f97316" }}>{result.casualtyAssessment.estimated.serious}</div></div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Fatal</div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-secondary)" }}>{result.casualtyAssessment.estimated.fatalities}</div></div>
                    </div>
                  )}

                  {result.triageProtocol && (
                    <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>{result.triageProtocol.system.toUpperCase()} PROTOCOL</div>
                      {result.triageProtocol.immediateActions.map((a, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {a}</div>
                      ))}
                    </div>
                  )}

                  {result.personsInvolved?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>KNOWN SUBJECTS</div>
                      {result.personsInvolved.map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(5,8,16,0.3)", borderRadius: 6, marginBottom: 4, borderLeft: p.triageTag ? `3px solid ${TRIAGE_COLORS[p.triageTag] || "#94a3b8"}` : "none" }}>
                          <div><span style={{ fontSize: 12, fontWeight: 600 }}>{p.role}</span><span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>{p.description}</span></div>
                          {p.triageTag && <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: 4, fontWeight: 700, color: TRIAGE_COLORS[p.triageTag] }}>{p.triageTag}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ICS Structure */}
              {result.incidentCommandStructure && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Briefcase size={15} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>ICS Command Structure</span></div>
                  {result.incidentCommandStructure.commandPost && <div style={{ fontSize: 13, marginBottom: 10 }}><strong>Command Post:</strong> {result.incidentCommandStructure.commandPost}</div>}
                  {result.incidentCommandStructure.sections && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {Object.entries(result.incidentCommandStructure.sections).map(([sec, desc]) => (
                        <div key={sec} style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{sec}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hazmat & Evacuation */}
              {(result.hazmatAssessment?.present || result.evacuationPlan?.required) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {result.hazmatAssessment?.present && (
                    <div className="section-card" style={{ borderColor: "rgba(249,115,22,0.3)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Flame size={14} color="#f97316" /><span style={{ fontSize: 13, fontWeight: 700, color: "#f97316" }}>HAZMAT PRESENT</span></div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Substance: {result.hazmatAssessment.substance || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Level: {result.hazmatAssessment.level}</div>
                      {result.hazmatAssessment.evacuationRadius && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Evac Radius: {result.hazmatAssessment.evacuationRadius}</div>}
                    </div>
                  )}
                  {result.evacuationPlan?.required && (
                    <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><AlertTriangle size={14} color="#10b981" /><span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>EVAC REQUIRED</span></div>
                      {result.evacuationPlan.zones.length > 0 && <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Zones:</strong> {result.evacuationPlan.zones.join(", ")}</div>}
                      {result.evacuationPlan.shelterLocations.length > 0 && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}><strong>Shelters:</strong> {result.evacuationPlan.shelterLocations.join(", ")}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* Communication Plan */}
              {result.communicationPlan && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Radio size={15} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Communication Plan</span></div>
                  {result.communicationPlan.publicAlert && (
                    <div style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🔔 Trigger Public Alert (EAS/WEA)</div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {result.communicationPlan.notifyAgencies.map((agency, i) => (
                      <span key={i} style={{ padding: "4px 10px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 100, fontSize: 11, color: "#06b6d4" }}>{agency}</span>
                    ))}
                  </div>
                  {result.communicationPlan.mediaGuidance && (
                    <div style={{ background: "rgba(5,8,16,0.3)", padding: "10px", borderRadius: 8, borderLeft: "2px solid var(--border)" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>MEDIA GUIDANCE</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>&quot;{result.communicationPlan.mediaGuidance}&quot;</div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result && <FollowUpChat moduleName="SafetyNet" contextData={result} color="#f59e0b" />}
    </ModuleLayout>
  );
}
