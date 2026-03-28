"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Stethoscope, Zap, AlertTriangle, Pill, TestTube,
  Heart, User, Activity, ShieldAlert, CheckCircle,
  Clock, Download, Brain, FileText, ChevronRight
} from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import InputZone from "@/components/InputZone";
import ConfidenceBar from "@/components/ConfidenceBar";
import FollowUpChat from "@/components/FollowUpChat";
import { MediScanResult } from "@/types";
import { fileToBase64, getSeverityColor, getSeverityBadgeClass, formatProcessingTime } from "@/lib/utils";

export default function MediScanPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MediScanResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text && !file) { toast.error("Please provide text or upload a file"); return; }
    setLoading(true); setResult(null);
    try {
      let fileData: string | undefined, mimeType: string | undefined;
      if (file) { fileData = await fileToBase64(file); mimeType = file.type; }
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: "mediscan", text: text || undefined, fileData, mimeType }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result as MediScanResult);
      setProcessingTime(data.processingTime);
      toast.success("Medical records analyzed");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
    a.download = "mediscan-report.json"; a.click();
  };

  const SAMPLES = [
    "Patient: John, 58M, BP 180/110, Diabetic Type 2, taking Metformin 500mg twice daily, Lisinopril 10mg. Allergy to Penicillin (anaphylaxis). Recent HbA1c: 8.2%, Creatinine: 1.8 mg/dL, eGFR: 42. Complains of headache and fatigue.",
    "Discharge summary: 72yo female admitted with chest pain. STEMI diagnosed. PCI performed. EF 35%. Medications: Aspirin 81mg, Atorvastatin 80mg, Metoprolol 25mg, Clopidogrel 75mg. Follow up cardiology in 2 weeks. No penicillin allergy.",
  ];

  return (
    <ModuleLayout title="MediScan" subtitle="Clinical Decision Support" icon={Stethoscope} color="#ef4444" gradient="linear-gradient(135deg,#ef4444,#f97316)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#ef4444,#f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>MediScan</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Upload any medical document — get a complete clinical brief instantly</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "380px 1fr" : "600px", gap: 20, justifyContent: result ? "unset" : "center" }}>
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
              <Activity size={14} color="#ef4444" /> Medical Input
            </h2>
            <InputZone onTextChange={setText} onFileChange={setFile}
              placeholder="Paste medical history, lab reports, discharge summaries, prescriptions..."
              acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"], "application/pdf": [".pdf"], "text/*": [".txt"] }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</> : <><Zap size={15} />Analyze Records</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={13} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}><Clock size={10} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>

          <div className="section-card">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Try a Sample</p>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 6, lineHeight: 1.5, transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
              >{s.substring(0, 100)}…</button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Critical Flags — shown FIRST, always */}
              {result.criticalFlags?.length > 0 && (
                <div className="section-card pulse-red" style={{ borderColor: "rgba(239,68,68,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>⚠ CRITICAL FLAGS — Immediate Action Required</span>
                  </div>
                  {result.criticalFlags.map((flag, i) => (
                    <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>{flag.flag}</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {flag.timeframe && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{flag.timeframe}</span>}
                          <span className={`badge badge-${flag.urgency === "emergency" ? "critical" : flag.urgency}`}>{flag.urgency}</span>
                        </div>
                      </div>
                      {flag.potentialConsequence && <p style={{ fontSize: 12, color: "#f97316", marginBottom: 4 }}>Risk: {flag.potentialConsequence}</p>}
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>→ {flag.immediateAction}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary + Triage */}
              <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={15} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Patient Overview</span>
                  </div>
                  {result.triagePriority && (
                    <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                      background: result.triagePriority === "immediate" ? "rgba(239,68,68,0.15)" : result.triagePriority === "urgent" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                      color: result.triagePriority === "immediate" ? "#ef4444" : result.triagePriority === "urgent" ? "#f59e0b" : "#10b981",
                      border: `1px solid ${result.triagePriority === "immediate" ? "rgba(239,68,68,0.3)" : result.triagePriority === "urgent" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
                      textTransform: "uppercase",
                    }}>Triage: {result.triagePriority}</span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Name", val: result.patientSummary.name },
                    { label: "Age / Gender", val: result.patientSummary.age },
                    { label: "Blood Type", val: result.patientSummary.bloodType },
                    { label: "Smoking", val: result.patientSummary.smokingStatus || "Unknown" },
                  ].map(item => (
                    <div key={item.label} style={{ background: "rgba(5,8,16,0.5)", borderRadius: 8, padding: "9px 12px" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>{result.summary}</p>
                <ConfidenceBar score={result.confidenceScore} quality={result.dataQuality} />
              </div>

              {/* Charlson Score */}
              {result.charlsonComorbidityIndex && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Brain size={14} color="#8b5cf6" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Charlson Comorbidity Index</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: "#8b5cf6" }}>{result.charlsonComorbidityIndex.score}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Score</div>
                    </div>
                    <div style={{ flex: 2, background: "rgba(5,8,16,0.4)", borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{result.charlsonComorbidityIndex.interpretation}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>10-yr survival: <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{result.charlsonComorbidityIndex.tenYearSurvivalRate}</span></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {result.charlsonComorbidityIndex.conditions.map((c, i) => (
                      <span key={i} style={{ padding: "3px 10px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, fontSize: 11, color: "#8b5cf6" }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Drug Interactions */}
              {result.drugInteractions && result.drugInteractions.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(249,115,22,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <AlertTriangle size={14} color="#f97316" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f97316" }}>Drug Interactions</span>
                  </div>
                  {result.drugInteractions.map((d, i) => (
                    <div key={i} style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{d.drug1} ↔ {d.drug2}</span>
                        <span className={`badge ${getSeverityBadgeClass(d.severity === "contraindicated" ? "critical" : d.severity)}`}>{d.severity}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>{d.effect}</p>
                      <p style={{ fontSize: 12, color: "#f97316" }}>→ {d.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Diagnoses */}
              {result.diagnoses?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Heart size={14} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 600 }}>Diagnoses</span></div>
                  {result.diagnoses.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 12px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{d.condition}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {d.icd10 && <span>ICD-10: {d.icd10}</span>}
                          {d.acuity && <span style={{ marginLeft: 8 }}>{d.acuity}</span>}
                        </div>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(d.severity)}`}>{d.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Vitals */}
              {result.vitalSigns?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Activity size={14} color="#3b82f6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Vital Signs</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {result.vitalSigns.map((v, i) => (
                      <div key={i} style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${getSeverityColor(v.status)}` }}>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>{v.name}</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: getSeverityColor(v.status) }}>{v.value} <span style={{ fontSize: 11, fontWeight: 400 }}>{v.unit}</span></div>
                        {v.note && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{v.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {result.medications?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Pill size={14} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Medications</span></div>
                  {result.medications.map((med, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#8b5cf6" }}>{med.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{med.purpose}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{med.dosage}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{med.frequency}{med.route ? ` · ${med.route}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lab Results */}
              {result.labResults?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><TestTube size={14} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Lab Results</span></div>
                  {result.labResults.map((lab, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", padding: "8px 12px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 5 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{lab.test}</div>
                        {lab.clinicalSignificance && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{lab.clinicalSignificance}</div>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: getSeverityColor(lab.status) }}>{lab.value} <span style={{ fontSize: 10, fontWeight: 400 }}>{lab.unit}</span></span>
                      <span className={`badge ${getSeverityBadgeClass(lab.status)}`}>{lab.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Allergies */}
              {result.allergies?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><ShieldAlert size={14} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600 }}>Allergies</span></div>
                  {result.allergies.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.allergen}</span>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 8 }}>→ {a.reaction}</span>
                        {a.crossReactivity && a.crossReactivity.length > 0 && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Cross-reactive: {a.crossReactivity.join(", ")}</div>}
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(a.severity)}`}>{a.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* SOAP Note */}
              {result.soapNote && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><FileText size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Auto-Generated SOAP Note</span></div>
                  {(["subjective", "objective", "assessment", "plan"] as const).map((key) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", marginBottom: 4 }}>{key}</div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, padding: "8px 12px", background: "rgba(16,185,129,0.04)", borderLeft: "2px solid rgba(16,185,129,0.3)", borderRadius: "0 6px 6px 0" }}>{result.soapNote![key]}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Care Protocol */}
              {result.careProtocol && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><CheckCircle size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Care Protocol</span></div>
                  {result.careProtocol.immediateActions.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", marginBottom: 6 }}>Immediate Actions</div>
                      {result.careProtocol.immediateActions.map((a, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(239,68,68,0.08)" }}>
                          <span style={{ color: "#ef4444", fontWeight: 700 }}>{i + 1}.</span>
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.careProtocol.specialistReferrals.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", marginBottom: 6 }}>Specialist Referrals</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.careProtocol.specialistReferrals.map((r, i) => (
                          <span key={i} style={{ padding: "4px 12px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 100, fontSize: 12, color: "#8b5cf6" }}>{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><ChevronRight size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600 }}>Recommendations</span></div>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < result.recommendations.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result && <FollowUpChat moduleName="MediScan" contextData={result} color="#ef4444" />}
    </ModuleLayout>
  );
}
