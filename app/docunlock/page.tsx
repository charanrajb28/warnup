"use client";
import { useState } from "react";
import { logClientEvent } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BookOpen, Zap, AlertTriangle, Scale, Calendar, DollarSign, CheckCircle, FileText, Clock, Download, Users, List, ChevronRight } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import InputZone from "@/components/InputZone";
import ConfidenceBar from "@/components/ConfidenceBar";
import FollowUpChat from "@/components/FollowUpChat";
import { DocUnlockResult } from "@/types";
import { fileToBase64, getSeverityBadgeClass, getSeverityColor, formatProcessingTime } from "@/lib/utils";

const RISK_BG: Record<string, string> = { critical: "rgba(239,68,68,0.07)", high: "rgba(249,115,22,0.07)", medium: "rgba(245,158,11,0.07)", low: "rgba(16,185,129,0.07)", none: "rgba(16,185,129,0.05)" };
const STATUS_ICON: Record<string, string> = { compliant: "✅", "non-compliant": "❌", unclear: "⚠️", "N/A": "—" };
const STATUS_COLOR: Record<string, string> = { compliant: "#10b981", "non-compliant": "#ef4444", unclear: "#f59e0b", "N/A": "#94a3b8" };

const SAMPLES = [
  "SERVICE AGREEMENT between TechCorp Inc. and ClientCo Ltd. dated Jan 1 2025. Term: 2 years. Monthly fee: $5,000. Either party may terminate with 30 days written notice. Governing law: California. Liability cap: $50,000. GDPR compliance required. Auto-renews annually unless 60-day notice given.",
  "REFUGEE IDENTITY CERTIFICATE - Name: Amara Hassan, DOB: 14 March 1991, Nationality: Somali, Status: Recognized Refugee. Case No: UNHCR-KEN-2019-448821. Issued by UNHCR Kenya, March 2019. Valid indefinitely subject to annual verification.",
];

export default function DocUnlockPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocUnlockResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text && !file) { toast.error("Provide text or upload a document"); return; }
    setLoading(true); setResult(null);
    try {
      logClientEvent("docunlock", "analyze_started");
      let fileData: string | undefined, mimeType: string | undefined;
      if (file) { fileData = await fileToBase64(file); mimeType = file.type; }
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: "docunlock", text: text || undefined, fileData, mimeType }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.result as DocUnlockResult);
      setProcessingTime(data.processingTime);
      toast.success("Document analyzed");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
    a.download = "docunlock-result.json"; a.click();
  };

  return (
    <ModuleLayout title="DocUnlock" subtitle="Document Intelligence" icon={BookOpen} color="#8b5cf6" gradient="linear-gradient(135deg,#8b5cf6,#06b6d4)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={26} color="white" /></div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>DocUnlock</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Contracts, IDs, forms — structured and risk-assessed instantly</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "360px 1fr" : "600px", gap: 20, justifyContent: result ? "unset" : "center" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-card" style={{ borderColor: "rgba(139,92,246,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}><FileText size={14} color="#8b5cf6" /> Document Input</h2>
            <InputZone onTextChange={setText} onFileChange={setFile} placeholder="Paste contract, certificate, form content..." acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg"], "application/pdf": [".pdf"], "text/*": [".txt"] }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)" }}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</> : <><Zap size={15} />Unlock Document</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={13} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}><Clock size={10} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>
          <div className="section-card">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Try a Sample</p>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 11px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 5, lineHeight: 1.5, transition: "all 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,92,246,0.05)")}
              >{s.substring(0, 100)}…</button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Red Flags */}
              {result.redFlags?.filter(f => f.severity === "critical" || f.severity === "high").length > 0 && (
                <div className="section-card pulse-red" style={{ borderColor: "rgba(239,68,68,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><AlertTriangle size={15} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>⚠ High-Risk Clauses</span></div>
                  {result.redFlags.filter(f => f.severity === "critical" || f.severity === "high").map((flag, i) => (
                    <div key={i} style={{ background: RISK_BG[flag.severity] || "rgba(239,68,68,0.07)", border: `1px solid ${getSeverityColor(flag.severity)}35`, borderRadius: 9, padding: "10px 14px", marginBottom: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: getSeverityColor(flag.severity) }}>{flag.issue}</span>
                        <span className={`badge ${getSeverityBadgeClass(flag.severity)}`}>{flag.severity}</span>
                      </div>
                      {flag.legalRisk && <p style={{ fontSize: 12, color: "#f97316", marginBottom: 4 }}>Legal risk: {flag.legalRisk}</p>}
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>→ {flag.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="section-card" style={{ borderColor: "rgba(139,92,246,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Document Type</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{result.documentType}</div>
                    {result.documentSubtype && <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{result.documentSubtype}</div>}
                  </div>
                  {result.riskScore && (
                    <div style={{ textAlign: "center", background: result.riskScore.overall > 60 ? "rgba(239,68,68,0.1)" : result.riskScore.overall > 30 ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${result.riskScore.overall > 60 ? "rgba(239,68,68,0.3)" : result.riskScore.overall > 30 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`, borderRadius: 12, padding: "10px 18px" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: result.riskScore.overall > 60 ? "#ef4444" : result.riskScore.overall > 30 ? "#f59e0b" : "#10b981" }}>{result.riskScore.overall}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Risk Score /100</div>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
                  {[{ label: "Jurisdiction", val: result.jurisdiction || "—" }, { label: "Governing Law", val: result.governingLaw || "—" }, { label: "Effective Date", val: result.effectiveDate || "—" }, { label: "Expiration", val: result.expirationDate || "—" }].map(item => (
                    <div key={item.label} style={{ background: "rgba(5,8,16,0.5)", borderRadius: 8, padding: "8px 11px" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>{result.summary}</p>
                {result.legalSummary && <p style={{ fontSize: 12, color: "#8b5cf6", fontStyle: "italic", padding: "9px 13px", background: "rgba(139,92,246,0.05)", borderLeft: "2px solid #8b5cf6", borderRadius: "0 6px 6px 0", marginBottom: 12 }}>{result.legalSummary}</p>}
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Risk Score Bars */}
              {result.riskScore && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Scale size={14} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Risk Breakdown</span></div>
                  {[{ label: "Legal", val: result.riskScore.legal }, { label: "Financial", val: result.riskScore.financial }, { label: "Operational", val: result.riskScore.operational }].map(item => (
                    <div key={item.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span>{item.label}</span>
                        <span style={{ fontWeight: 700, color: item.val > 60 ? "#ef4444" : item.val > 30 ? "#f59e0b" : "#10b981" }}>{item.val}/100</span>
                      </div>
                      <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${item.val}%`, background: item.val > 60 ? "#ef4444" : item.val > 30 ? "#f59e0b" : "#10b981", borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Parties */}
              {result.parties?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Users size={14} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Parties</span></div>
                  {result.parties.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 12px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 10, background: "rgba(6,182,212,0.12)", color: "#06b6d4", padding: "2px 7px", borderRadius: 100, fontWeight: 700, marginRight: 8 }}>{p.role}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        {p.signatoryAuthority && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Signatory: {p.signatoryAuthority}</div>}
                      </div>
                      {p.entityType && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.entityType}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Obligation Matrix */}
              {result.obligationMatrix && result.obligationMatrix.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><List size={14} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600 }}>Obligation Matrix</span></div>
                  {result.obligationMatrix.map((ob, i) => (
                    <div key={i} style={{ background: RISK_BG[ob.priority] || "rgba(245,158,11,0.06)", border: `1px solid ${getSeverityColor(ob.priority)}30`, borderRadius: 9, padding: "10px 14px", marginBottom: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{ob.party}</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          {ob.deadline && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Due: {ob.deadline}</span>}
                          <span className={`badge ${getSeverityBadgeClass(ob.priority)}`}>{ob.priority}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, marginBottom: 4 }}>{ob.obligation}</p>
                      <p style={{ fontSize: 11, color: "#f97316" }}>If not met: {ob.consequence}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Dates */}
              {result.dates?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Calendar size={14} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Key Dates</span></div>
                  {result.dates.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 5 }}>
                      <div><div style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.significance}</div></div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.date}</div>
                        {d.urgency && <span className={`badge ${getSeverityBadgeClass(d.urgency)}`}>{d.urgency}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Compliance */}
              {result.complianceChecklist && result.complianceChecklist.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><CheckCircle size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600 }}>Compliance Checklist</span></div>
                  {result.complianceChecklist.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{STATUS_ICON[c.status] || "—"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: STATUS_COLOR[c.status] || "var(--text-primary)" }}>{c.regulation}</span>
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.status}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.finding}</p>
                        {c.remediation && <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>Fix: {c.remediation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Financial Terms */}
              {result.financialTerms && result.financialTerms.totalValue && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><DollarSign size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600 }}>Financial Terms</span></div>
                  <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 9, padding: "12px 16px", textAlign: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>{result.financialTerms.totalValue} {result.financialTerms.currency || ""}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Contract Value</div>
                  </div>
                  {result.financialTerms.penalties?.length > 0 && result.financialTerms.penalties.map((p, i) => (
                    <p key={i} style={{ fontSize: 12, color: "var(--text-secondary)", padding: "5px 0", borderBottom: "1px solid rgba(239,68,68,0.08)" }}>⚠ {p}</p>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {result.nextSteps?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><ChevronRight size={14} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Next Steps</span></div>
                  {result.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < result.nextSteps.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result && <FollowUpChat moduleName="DocUnlock" contextData={result} color="#8b5cf6" />}
    </ModuleLayout>
  );
}
