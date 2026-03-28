"use client";
import { useState } from "react";
import { logClientEvent } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Newspaper, Zap, Globe, Clock, Users, CheckCircle, TrendingUp, Download, ShieldCheck, AlarmClock, Crosshair, Scale, AlertTriangle } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";
import ConfidenceBar from "@/components/ConfidenceBar";
import FollowUpChat from "@/components/FollowUpChat";
import { NewsFilterResult } from "@/types";
import { getSeverityBadgeClass, formatProcessingTime, capitalize } from "@/lib/utils";

const CLAIM_STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  verified: { bg: "rgba(16,185,129,0.08)", color: "#10b981", border: "rgba(16,185,129,0.2)" },
  unverified: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  disputed: { bg: "rgba(249,115,22,0.08)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
  false: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
};
const CATEGORY_EMOJIS: Record<string, string> = { politics: "🏛️", health: "🏥", technology: "💻", disaster: "🌪️", crime: "⚖️", economy: "📈", environment: "🌍", social: "👥", science: "🔬", other: "📰" };
const MISINFO_RISK_CONFIG: Record<string, { color: string; label: string }> = { low: { color: "#10b981", label: "Low Misinformation Risk" }, medium: { color: "#f59e0b", label: "Moderate Misinformation Risk" }, high: { color: "#ef4444", label: "High Misinformation Risk: Do Not Share" }, confirmed_disinformation: { color: "#ef4444", label: "CONFIRMED DISINFORMATION" } };

export default function NewsFilterPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NewsFilterResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error("Please paste a news article or text"); return; }
    setLoading(true); setResult(null);
    try {
      logClientEvent("newsfilter", "analyze_started");
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
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })); a.download = "newsfilter-result.json"; a.click();
  };

  const SAMPLES = [
    "BREAKING: Scientists at Harvard claim they've developed a new drug that cures all cancers with a single injection. The study published yesterday showed 100% success rate in trials. Government health officials have not yet commented.",
    "FLOOD DISASTER: Severe flash floods hit Chennai, India on March 28 2026, displacing over 50,000 residents. The state government has declared emergency and deployed NDRF teams. Relief camps established at 15 locations.",
  ];

  const misinfoConfig = MISINFO_RISK_CONFIG[result?.misinformationRisk.toLowerCase().replace(" ", "_") || "medium"] || MISINFO_RISK_CONFIG.medium;

  return (
    <ModuleLayout title="NewsFilter" subtitle="Truth Intelligence Engine" icon={Newspaper} color="#06b6d4" gradient="linear-gradient(135deg,#06b6d4,#10b981)">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#06b6d4,#10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}><Newspaper size={28} color="white" /></div>
          <div><h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.03em" }}>NewsFilter</h1><p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Paste any news — get fact-checked, verified, structured intelligence</p></div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "360px 1fr" : "600px", gap: 20, justifyContent: result ? "unset" : "center" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-card" style={{ borderColor: "rgba(6,182,212,0.2)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}><Newspaper size={14} color="#06b6d4" /> Article Input</h2>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste a news article, headline, social media post..." style={{ width: "100%", minHeight: 220, background: "rgba(5,8,16,0.5)", border: "1px solid var(--border)", borderRadius: 9, padding: "12px 14px", color: "var(--text-primary)", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit" }} onFocus={e => (e.target.style.borderColor = "rgba(6,182,212,0.5)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#06b6d4,#10b981)" }}>{loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</> : <><Zap size={15} />Analyze Article</>}</button>
              {result && <button className="btn-secondary" onClick={downloadJSON}><Download size={13} /></button>}
            </div>
            {processingTime && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}><Clock size={10} style={{ display: "inline" }} /> {formatProcessingTime(processingTime)}</p>}
          </div>
          <div className="section-card">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Try a Sample</p>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => setText(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 11px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", marginBottom: 5, lineHeight: 1.5, transition: "all 0.18s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.1)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}>{s.substring(0, 100)}…</button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Misinfo Red Flag */}
              {(result.misinformationRisk.toLowerCase().includes("high") || result.misinformationRisk.toLowerCase().includes("disinformation")) && (
                <div className="section-card pulse-red" style={{ borderColor: "rgba(239,68,68,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><ShieldCheck size={16} color="#ef4444" /><span style={{ fontSize: 15, fontWeight: 800, color: "#ef4444" }}>{misinfoConfig.label}</span></div>
                  {result.actionableAlerts?.filter(a => a.priority === "critical" || a.priority === "high").map((alert, i) => (
                    <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 9, padding: "10px 14px", marginTop: 8 }}>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{alert.alert}</p>
                      {alert.action && <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>→ Action: {alert.action}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="section-card" style={{ borderColor: "rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.03)" }}>
                <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>{CATEGORY_EMOJIS[result.category] || "📰"}</span>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{result.headline}</h2>
                      {result.suggestedAccurateHeadline && <p style={{ fontSize: 12, color: "#06b6d4" }}>Suggested: {result.suggestedAccurateHeadline}</p>}
                    </div>
                  </div>
                  {result.sourceCredibilityScore !== undefined && (
                    <div style={{ textAlign: "center", minWidth: 60, flexShrink: 0, background: result.sourceCredibilityScore < 4 ? "rgba(239,68,68,0.1)" : result.sourceCredibilityScore < 7 ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${result.sourceCredibilityScore < 4 ? "rgba(239,68,68,0.3)" : result.sourceCredibilityScore < 7 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`, borderRadius: 10, padding: "8px 10px" }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: result.sourceCredibilityScore < 4 ? "#ef4444" : result.sourceCredibilityScore < 7 ? "#f59e0b" : "#10b981" }}>{result.sourceCredibilityScore}</div>
                      <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Source/10</div>
                    </div>
                  )}
                </div>
                
                <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  <span className={`badge ${getSeverityBadgeClass(result.impactAssessment.urgency === "breaking" ? "critical" : result.impactAssessment.urgency)}`}>{result.impactAssessment.urgency === "breaking" ? "🔴 BREAKING" : capitalize(result.impactAssessment.urgency)}</span>
                  <span className={`badge ${getSeverityBadgeClass(result.impactAssessment.severity)}`}>{result.impactAssessment.severity} Impact</span>
                  {result.originalSource !== "Unknown" && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center" }}><Globe size={11} style={{ marginRight: 4 }} /> {result.originalSource}</span>}
                  {result.publishDate && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center" }}><Clock size={11} style={{ marginRight: 4 }} /> {result.publishDate}</span>}
                  {result.geography.countries.length > 0 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>🌍 {result.geography.countries.join(", ")}</span>}
                </div>
                
                {result.sourceCredibilityReason && <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontStyle: "italic" }}>Source Credibility: {result.sourceCredibilityReason}</p>}
                
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>{result.summary}</p>
                {result.analystBrief && <p style={{ fontSize: 12, color: "#10b981", fontStyle: "italic", padding: "8px 12px", background: "rgba(16,185,129,0.05)", borderLeft: "2px solid #10b981", borderRadius: "0 6px 6px 0", marginBottom: 12 }}>{result.analystBrief}</p>}
                
                {(!result.misinformationRisk.toLowerCase().includes("high") && !result.misinformationRisk.toLowerCase().includes("disinformation")) && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: `${misinfoConfig.color}11`, border: `1px solid ${misinfoConfig.color}33`, borderRadius: 100, marginBottom: 12 }}>
                    <ShieldCheck size={14} color={misinfoConfig.color} /><span style={{ fontSize: 11, fontWeight: 700, color: misinfoConfig.color, textTransform: "uppercase" }}>{misinfoConfig.label}</span>
                  </div>
                )}
                <ConfidenceBar score={result.confidenceScore} />
              </div>

              {/* Claims Verification */}
              {result.claims?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><CheckCircle size={15} color="#10b981" /><span style={{ fontSize: 14, fontWeight: 600 }}>Claims Verification</span></div>
                  {result.claims.map((claim, i) => {
                    const cfg = CLAIM_STATUS_COLORS[claim.status.toLowerCase()] || CLAIM_STATUS_COLORS.unverified;
                    return (
                      <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 9, padding: "10px 14px", marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, lineHeight: 1.5 }}>{claim.claim}</span>
                          <span style={{ padding: "3px 10px", borderRadius: 100, background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}35`, fontSize: 10, fontWeight: 800, textTransform: "uppercase", flexShrink: 0, letterSpacing: "0.05em" }}>{claim.status}</span>
                        </div>
                        {claim.explanation && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, marginBottom: 4 }}>{claim.explanation}</p>}
                        {claim.contradictingEvidence && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>↳ Contradicting: {claim.contradictingEvidence}</p>}
                        {claim.source && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Source: {claim.source}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Propaganda Techniques */}
              {result.propagandaTechniques && result.propagandaTechniques.length > 0 && (
                <div className="section-card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><AlertTriangle size={15} color="#ef4444" /><span style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>Propaganda Techniques Detected</span></div>
                  {result.propagandaTechniques.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "9px 12px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, marginBottom: 6 }}>
                      <div><div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>{p.technique}</div><p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>&quot;{p.example}&quot;</p></div>
                      <span className={`badge ${getSeverityBadgeClass(p.severity)}`}>{p.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bias Analysis */}
              {result.biasAnalysis && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Scale size={15} color="#f97316" /><span style={{ fontSize: 14, fontWeight: 600, color: "#f97316" }}>Bias & Framing Analysis</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {result.biasAnalysis.politicalLeaning && <div style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "8px 11px" }}><div style={{ fontSize: 10, color: "var(--text-muted)" }}>Political Leaning</div><div style={{ fontSize: 12, fontWeight: 600 }}>{result.biasAnalysis.politicalLeaning}</div></div>}
                    {result.biasAnalysis.emotionalAppeal && <div style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "8px 11px" }}><div style={{ fontSize: 10, color: "var(--text-muted)" }}>Emotional Appeal</div><div style={{ fontSize: 12, fontWeight: 600 }}>{result.biasAnalysis.emotionalAppeal}</div></div>}
                  </div>
                  <div style={{ background: "rgba(5,8,16,0.4)", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Framing</div><p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{result.biasAnalysis.framing}</p>
                  </div>
                  {(result.biasAnalysis.loadedLanguage.length > 0 || result.biasAnalysis.omissions.length > 0) && (
                    <div style={{ display: "flex", gap: 12 }}>
                      {result.biasAnalysis.loadedLanguage.length > 0 && <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Loaded Language</div><ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "#f97316" }}>{result.biasAnalysis.loadedLanguage.map((l, i) => <li key={i}>{l}</li>)}</ul></div>}
                      {result.biasAnalysis.omissions.length > 0 && <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Omissions</div><ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>{result.biasAnalysis.omissions.map((o, i) => <li key={i}>{o}</li>)}</ul></div>}
                    </div>
                  )}
                </div>
              )}

              {/* OSINT Classification */}
              {result.osintClassification && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Crosshair size={15} color="#8b5cf6" /><span style={{ fontSize: 14, fontWeight: 600, color: "#8b5cf6" }}>OSINT Classification</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { l: "Info Type", v: result.osintClassification.informationType },
                      { l: "Relevant Sectors", v: result.osintClassification.relevantToSectors.join(", ") },
                      { l: "Geo Risk", v: result.osintClassification.geopoliticalRisk },
                      { l: "Market Sens.", v: result.osintClassification.marketSensitivity }
                    ].map(item => (
                      <div key={item.l} style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, padding: "8px 11px" }}>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{item.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Facts */}
              {result.keyFacts?.length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><TrendingUp size={15} color="#3b82f6" /><span style={{ fontSize: 14, fontWeight: 600 }}>Key Facts (Verifiable)</span></div>
                  {result.keyFacts.map((fact, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{fact.fact}</span>
                      <span className={`badge ${getSeverityBadgeClass(fact.confidence === "high" ? "low" : fact.confidence === "medium" ? "medium" : "critical")}`}>{fact.confidence}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Entities (People & Orgs) */}
              {(result.people?.length > 0 || result.organizations?.length > 0) && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Users size={15} color="#06b6d4" /><span style={{ fontSize: 14, fontWeight: 600 }}>Entities</span></div>
                  {result.people?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>PEOPLE</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.people.map((p, i) => (
                          <div key={i} style={{ padding: "6px 10px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}{p.quoted && <span style={{ fontSize: 10, marginLeft: 4, color: "#06b6d4" }}>(Quoted)</span>}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.role}{p.organization && ` at ${p.organization}`}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.organizations?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>ORGANIZATIONS</div>
                      {result.organizations.map((o, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "rgba(5,8,16,0.4)", borderRadius: 8, marginBottom: 4 }}>
                          <div><div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div><div style={{ fontSize: 10, color: "var(--text-muted)" }}>{o.type}{o.role && ` · ${o.role}`}</div></div>
                          {o.credibility && <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{o.credibility}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actionable Alerts (Lower Priority) */}
              {result.actionableAlerts?.filter(a => a.priority !== "critical" && a.priority !== "high").length > 0 && (
                <div className="section-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><AlarmClock size={15} color="#f59e0b" /><span style={{ fontSize: 14, fontWeight: 600 }}>Actionable Alerts & Advisories</span></div>
                  {result.actionableAlerts.filter(a => a.priority !== "critical" && a.priority !== "high").map((alert, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, marginBottom: 5 }}>
                      <div><div style={{ fontSize: 13 }}>{alert.alert}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>For: {alert.for}</div></div>
                      <span className={`badge ${getSeverityBadgeClass(alert.priority)}`}>{alert.priority}</span>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result && <FollowUpChat moduleName="NewsFilter" contextData={result} color="#06b6d4" />}
    </ModuleLayout>
  );
}
