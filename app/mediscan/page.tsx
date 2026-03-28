"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Stethoscope, Zap, AlertTriangle, Pill, TestTube,
  Heart, User, Activity, ShieldAlert, CheckCircle, Clock, Download
} from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import InputZone from "@/components/InputZone";
import ConfidenceBar from "@/components/ConfidenceBar";
import { MediScanResult } from "@/types";
import { fileToBase64, getSeverityColor, getSeverityBadgeClass, formatProcessingTime, capitalize } from "@/lib/utils";

export default function MediScanPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MediScanResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text && !file) {
      toast.error("Please provide text or upload a file");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let fileData: string | undefined;
      let mimeType: string | undefined;
      if (file) {
        fileData = await fileToBase64(file);
        mimeType = file.type;
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: "mediscan", text: text || undefined, fileData, mimeType }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result as MediScanResult);
      setProcessingTime(data.processingTime);
      toast.success("Medical records analyzed successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mediscan-result.json"; a.click();
  };

  return (
    <ModuleLayout
      title="MediScan"
      subtitle="Medical Record Intelligence"
      icon={Stethoscope}
      color="#ef4444"
      gradient="linear-gradient(135deg,#ef4444 0%,#f97316 100%)"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#ef4444,#f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>MediScan</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Upload any medical document for instant structured analysis</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 24 }}>
        {/* Input panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="#ef4444" /> Medical Input
            </h2>
            <InputZone
              onTextChange={setText}
              onFileChange={setFile}
              placeholder="Paste medical history, lab reports, discharge summaries, prescriptions, or any medical text..."
              acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"], "application/pdf": [".pdf"], "text/*": [".txt"] }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Zap size={16} /> Analyze Records</>}
              </button>
              {result && (
                <button className="btn-secondary" onClick={downloadJSON}>
                  <Download size={14} /> JSON
                </button>
              )}
            </div>
            {processingTime && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
                <Clock size={11} style={{ display: "inline", marginRight: 4 }} />Processed in {formatProcessingTime(processingTime)}
              </p>
            )}
          </div>

          {/* Sample prompts */}
          <div className="section-card" style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Try a sample</p>
            {[
              "Patient: John, 58M, BP 180/110, Diabetic Type 2, taking Metformin 500mg twice daily, allergy to Penicillin. Recent HbA1c: 8.2%, Creatinine: 1.8 mg/dL",
              "Discharge summary: 72yo female admitted with chest pain. STEMI. PCI performed. EF 35%. Medications: Aspirin 81mg, Atorvastatin 80mg, Metoprolol 25mg. Follow up in 2 weeks.",
            ].map((sample, i) => (
              <button key={i} onClick={() => { setText(sample); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", marginBottom: 8, lineHeight: 1.5, transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
              >
                {sample.substring(0, 90)}…
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results panel */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Summary + Confidence */}
              <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <User size={16} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Patient Summary</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Name", val: result.patientSummary.name },
                    { label: "Age", val: result.patientSummary.age },
                    { label: "Gender", val: result.patientSummary.gender },
                    { label: "Blood Type", val: result.patientSummary.bloodType },
                  ].map(item => (
                    <div key={item.label} style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{result.summary}</p>
                <ConfidenceBar score={result.confidenceScore} quality={result.dataQuality} />
              </div>

              {/* Critical Flags */}
              {result.criticalFlags?.length > 0 && (
                <div className="section-card pulse-red" style={{ borderColor: "rgba(239,68,68,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>⚠ CRITICAL FLAGS</span>
                  </div>
                  {result.criticalFlags.map((flag, i) => (
                    <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>{flag.flag}</span>
                        <span className={`badge badge-${flag.urgency}`}>{flag.urgency}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>→ {flag.action}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Diagnoses */}
              {result.diagnoses?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Heart size={16} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Diagnoses</span>
                  </div>
                  {result.diagnoses.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{d.condition}</div>
                        {d.icd10 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ICD-10: {d.icd10}</div>}
                        {d.date && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.date}</div>}
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(d.severity)}`}>{d.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Vital Signs */}
              {result.vitalSigns?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Activity size={16} color="#3b82f6" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Vital Signs</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {result.vitalSigns.map((v, i) => (
                      <div key={i} style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${getSeverityColor(v.status)}` }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{v.name}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: getSeverityColor(v.status) }}>{v.value}</div>
                        {v.note && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{v.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {result.medications?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Pill size={16} color="#8b5cf6" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Medications</span>
                  </div>
                  {result.medications.map((med, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#8b5cf6" }}>{med.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{med.purpose}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{med.dosage}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{med.frequency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Allergies */}
              {result.allergies?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <ShieldAlert size={16} color="#f59e0b" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Allergies</span>
                  </div>
                  {result.allergies.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.allergen}</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 8 }}>→ {a.reaction}</span>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(a.severity)}`}>{a.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Lab Results */}
              {result.labResults?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <TestTube size={16} color="#06b6d4" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Lab Results</span>
                  </div>
                  {result.labResults.map((lab, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", padding: "9px 14px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{lab.test}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: getSeverityColor(lab.status) }}>{lab.value}</span>
                      <span className={`badge ${getSeverityBadgeClass(lab.status)}`}>{lab.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Recommendations</span>
                  </div>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < result.recommendations.length - 1 ? "1px solid rgba(16,185,129,0.1)" : "none" }}>
                      <span style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{rec}</span>
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
