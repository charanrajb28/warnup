"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FileSearch, Zap, AlertTriangle, Calendar, Users, DollarSign, ChevronRight, Clock, Download, FileText } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import InputZone from "@/components/InputZone";
import ConfidenceBar from "@/components/ConfidenceBar";
import { DocUnlockResult } from "@/types";
import { fileToBase64, getSeverityColor, getSeverityBadgeClass, formatProcessingTime, capitalize } from "@/lib/utils";

const CONFIDENCE_COLOR: Record<string, string> = { high: "#10b981", medium: "#f59e0b", low: "#ef4444" };

export default function DocUnlockPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocUnlockResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text && !file) { toast.error("Please provide text or upload a document"); return; }
    setLoading(true); setResult(null);
    try {
      let fileData: string | undefined, mimeType: string | undefined;
      if (file) { fileData = await fileToBase64(file); mimeType = file.type; }
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: "docunlock", text: text || undefined, fileData, mimeType }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result as DocUnlockResult);
      setProcessingTime(data.processingTime);
      toast.success("Document unlocked successfully!");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "docunlock-result.json"; a.click();
  };

  return (
    <ModuleLayout title="DocUnlock" subtitle="Universal Document Parser" icon={FileSearch} color="#8b5cf6" gradient="linear-gradient(135deg,#8b5cf6,#06b6d4)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileSearch size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>DocUnlock</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Upload any document — contracts, forms, invoices — get structured data instantly</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 24 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="section-card" style={{ borderColor: "rgba(139,92,246,0.2)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><FileText size={15} color="#8b5cf6" /> Document Input</h2>
            <InputZone
              onTextChange={setText} onFileChange={setFile}
              placeholder="Paste document text, contract clauses, invoice details, form data, or any unstructured document content..."
              acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"], "application/pdf": [".pdf"], "text/*": [".txt"] }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)" }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Unlocking...</> : <><Zap size={16} /> Unlock Document</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={14} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}><Clock size={11} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>

          {/* Samples */}
          <div className="section-card" style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Sample Documents</p>
            {[
              "LEASE AGREEMENT between John Smith (Tenant) and ABC Properties Ltd (Landlord). Monthly rent: $1,500. Security deposit: $3,000. Lease term: 12 months starting Jan 1, 2025. Late fee: $150 after 5-day grace period.",
              "INVOICE #INV-2024-0892. Client: TechCorp Inc. Due: 30 days. Items: Software License $4,500, Support Package $1,200, Setup Fee $500. Total: $6,200. Payment: Wire transfer only.",
            ].map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 6, lineHeight: 1.5, transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,92,246,0.05)")}
              >
                {s.substring(0, 100)}…
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Doc summary */}
              <div className="section-card" style={{ borderColor: "rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>DOCUMENT TYPE</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{result.documentType}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`badge badge-${result.dataCompleteness === "comprehensive" ? "normal" : result.dataCompleteness === "complete" ? "medium" : "warning"}`}>
                      {result.dataCompleteness}
                    </span>
                    {result.documentDate && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{result.documentDate}</div>}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{result.summary}</p>
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Red Flags */}
              {result.redFlags?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <AlertTriangle size={15} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>⚠ Red Flags</span>
                  </div>
                  {result.redFlags.map((flag, i) => (
                    <div key={i} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{flag.issue}</span>
                        <span className={`badge ${getSeverityBadgeClass(flag.severity)}`}>{flag.severity}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>→ {flag.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Parties */}
              {result.parties?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Users size={15} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Parties Involved</span></div>
                  {result.parties.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 12, color: "#06b6d4", fontWeight: 600 }}>{p.role}</span>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                        {p.contact && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.contact}</div>}
                      </div>
                      {p.identifier && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.identifier}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Key Fields */}
              {result.keyFields?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><FileText size={15} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Key Fields</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {result.keyFields.map((field, i) => (
                      <div key={i} style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${CONFIDENCE_COLOR[field.confidence] || "#94a3b8"}` }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{field.field}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{field.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Numbers / Financials */}
              {result.numbers?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><DollarSign size={15} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600 }}>Numbers & Amounts</span></div>
                  {result.numbers.map((n, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{n.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{n.currency && `${n.currency} `}{n.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dates */}
              {result.dates?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Calendar size={15} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600 }}>Important Dates</span></div>
                  {result.dates.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.significance}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>{d.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {result.nextSteps?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><ChevronRight size={15} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>Next Steps</span></div>
                  {result.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < result.nextSteps.length - 1 ? "1px solid rgba(16,185,129,0.1)" : "none" }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{step}</span>
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
