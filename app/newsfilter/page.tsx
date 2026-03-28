"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Newspaper, Zap, Globe, Clock, AlertCircle, Users, CheckCircle, TrendingUp, Download, ShieldCheck, AlarmClock } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import ConfidenceBar from "@/components/ConfidenceBar";
import { NewsFilterResult } from "@/types";
import { getSeverityBadgeClass, formatProcessingTime, capitalize } from "@/lib/utils";

const CLAIM_STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  verified: { bg: "rgba(16,185,129,0.08)", color: "#10b981", border: "rgba(16,185,129,0.2)" },
  unverified: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  disputed: { bg: "rgba(249,115,22,0.08)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
  false: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
};
const CATEGORY_EMOJIS: Record<string, string> = {
  politics: "🏛️", health: "🏥", technology: "💻", disaster: "🌪️",
  crime: "⚖️", economy: "📈", environment: "🌍", social: "👥", science: "🔬", other: "📰",
};
const MISINFO_RISK_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: "#10b981", label: "Low Misinformation Risk" },
  medium: { color: "#f59e0b", label: "Moderate Misinformation Risk" },
  high: { color: "#ef4444", label: "High Misinformation Risk" },
};

export default function NewsFilterPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NewsFilterResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error("Please paste a news article or text"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: "newsfilter", text }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result as NewsFilterResult);
      setProcessingTime(data.processingTime);
      toast.success("News article analyzed!");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "newsfilter-result.json"; a.click();
  };

  return (
    <ModuleLayout title="NewsFilter" subtitle="Truth Intelligence Engine" icon={Newspaper} color="#06b6d4" gradient="linear-gradient(135deg,#06b6d4,#10b981)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#06b6d4,#10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Newspaper size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>NewsFilter</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Paste any news article — get fact-checked, verified, structured intelligence</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "1fr", gap: 24 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="section-card" style={{ borderColor: "rgba(6,182,212,0.2)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Newspaper size={15} color="#06b6d4" /> Article Input</h2>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste a news article, headline, press release, social media post, or any news content you want fact-checked and analyzed..."
              style={{ width: "100%", minHeight: 260, background: "rgba(5,8,16,0.5)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", color: "var(--text-primary)", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "rgba(6,182,212,0.5)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#06b6d4,#10b981)" }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Zap size={16} /> Analyze Article</>}
              </button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={14} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}><Clock size={11} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>

          {/* Samples */}
          <div className="section-card" style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Sample Articles</p>
            {[
              "BREAKING: Scientists at Harvard claim they've developed a new drug that cures all cancers with a single injection. The study published yesterday showed 100% success rate in trials. Government health officials have not yet commented.",
              "FLOOD DISASTER: Severe flash floods hit Chennai, India on March 28 2026, displacing over 50,000 residents. The state government has declared emergency and deployed NDRF teams. Relief camps established at 15 locations.",
            ].map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 6, lineHeight: 1.5, transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}
              >{s.substring(0, 110)}…</button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Header card */}
              <div className="section-card" style={{ borderColor: "rgba(6,182,212,0.25)", background: "rgba(6,182,212,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{CATEGORY_EMOJIS[result.category] || "📰"}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span className={`badge ${getSeverityBadgeClass(result.impactAssessment.urgency === "breaking" ? "critical" : result.impactAssessment.urgency)}`}>
                      {result.impactAssessment.urgency === "breaking" ? "🔴 BREAKING" : capitalize(result.impactAssessment.urgency)}
                    </span>
                    <span className={`badge ${getSeverityBadgeClass(result.impactAssessment.severity)}`}>{result.impactAssessment.severity} impact</span>
                  </div>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{result.headline}</h2>
                <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                  {result.originalSource !== "Unknown" && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📡 {result.originalSource}</span>}
                  {result.publishDate && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📅 {result.publishDate}</span>}
                  {result.geography.countries.length > 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>🌍 {result.geography.countries.join(", ")}</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>{result.summary}</p>

                {/* Misinformation risk */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `${MISINFO_RISK_CONFIG[result.misinformationRisk]?.color}11`, border: `1px solid ${MISINFO_RISK_CONFIG[result.misinformationRisk]?.color}33`, borderRadius: 8, marginBottom: 14 }}>
                  <ShieldCheck size={16} color={MISINFO_RISK_CONFIG[result.misinformationRisk]?.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: MISINFO_RISK_CONFIG[result.misinformationRisk]?.color }}>{MISINFO_RISK_CONFIG[result.misinformationRisk]?.label}</span>
                </div>
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Claims */}
              {result.claims?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><CheckCircle size={15} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600 }}>Claims Verification</span></div>
                  {result.claims.map((claim, i) => {
                    const cfg = CLAIM_STATUS_COLORS[claim.status] || CLAIM_STATUS_COLORS.unverified;
                    return (
                      <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 9, padding: "11px 14px", marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, flex: 1, lineHeight: 1.5 }}>{claim.claim}</span>
                          <span style={{ marginLeft: 12, padding: "2px 9px", borderRadius: 100, background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44`, fontSize: 11, fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}>{claim.status}</span>
                        </div>
                        {claim.source && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Source: {claim.source}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Key Facts */}
              {result.keyFacts?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><TrendingUp size={15} color="#3b82f6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Key Facts</span></div>
                  {result.keyFacts.map((fact, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "9px 14px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{fact.fact}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: fact.confidence === "high" ? "rgba(16,185,129,0.1)" : fact.confidence === "medium" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: fact.confidence === "high" ? "#10b981" : fact.confidence === "medium" ? "#f59e0b" : "#ef4444", flexShrink: 0 }}>{fact.confidence}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* People */}
              {result.people?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Users size={15} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600 }}>People Mentioned</span></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.people.map((p, i) => (
                      <div key={i} style={{ padding: "8px 14px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 9 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.role}{p.organization && ` · ${p.organization}`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Alerts */}
              {result.actionableAlerts?.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><AlarmClock size={15} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>Actionable Alerts</span></div>
                  {result.actionableAlerts.map((alert, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{alert.alert}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>For: {alert.for}</div>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(alert.priority)}`}>{alert.priority}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bias Indicators */}
              {result.biasIndicators?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><AlertCircle size={15} color="#f97316" /><span style={{ fontSize: 14, fontWeight: 600 }}>Bias Indicators</span></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.biasIndicators.map((b, i) => (
                      <span key={i} style={{ padding: "4px 12px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 100, fontSize: 12, color: "#f97316" }}>{b}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {result.timeline?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Clock size={15} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Event Timeline</span></div>
                  <div style={{ position: "relative", paddingLeft: 24 }}>
                    <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 1, background: "var(--border)" }} />
                    {result.timeline.map((t, i) => (
                      <div key={i} style={{ position: "relative", marginBottom: 14 }}>
                        <div style={{ position: "absolute", left: -20, top: 4, width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" }} />
                        <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, marginBottom: 3 }}>{t.date}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.event}</div>
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
