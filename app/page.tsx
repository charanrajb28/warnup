"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope, Mic, FileSearch, Newspaper, ShieldAlert,
  ArrowRight, Zap, Brain, Globe, ChevronRight, Sparkles,
  CheckCircle, Activity
} from "lucide-react";
import LiveFeed from "@/components/LiveFeed";

const modules = [
  {
    id: "mediscan",
    icon: Stethoscope,
    title: "MediScan",
    subtitle: "Medical Record Intelligence",
    description:
      "Upload any medical document—scanned records, lab reports, handwritten notes—and get a complete structured health profile with critical alerts.",
    color: "var(--accent-red)",
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    border: "rgba(239,68,68,0.3)",
    glow: "rgba(239,68,68,0.1)",
    features: ["Vital signs extraction", "Drug interaction flags", "Critical risk alerts", "Lab result analysis"],
    badge: "Life-Critical",
  },
  {
    id: "voicebridge",
    icon: Mic,
    title: "VoiceBridge",
    subtitle: "Voice → Structured Intent",
    description:
      "Record or upload any audio/voice memo in any language. ClearPath transcribes, understands intent, and creates structured action plans.",
    color: "var(--accent-blue)",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    border: "rgba(59,130,246,0.3)",
    glow: "rgba(59,130,246,0.1)",
    features: ["Multi-language support", "Intent categorization", "Action item extraction", "Urgency detection"],
    badge: "Real-Time",
  },
  {
    id: "docunlock",
    icon: FileSearch,
    title: "DocUnlock",
    subtitle: "Universal Document Parser",
    description:
      "Drop any document—PDFs, contracts, handwritten forms, screenshots—and instantly get clean, structured data with red flags and action items.",
    color: "var(--accent-purple)",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
    border: "rgba(139,92,246,0.3)",
    glow: "rgba(139,92,246,0.1)",
    features: ["OCR + AI parsing", "Key clause extraction", "Red flag detection", "JSON export"],
    badge: "Smart OCR",
  },
  {
    id: "newsfilter",
    icon: Newspaper,
    title: "NewsFilter",
    subtitle: "Truth Intelligence Engine",
    description:
      "Paste any news article or URL. ClearPath fact-checks claims, identifies bias, extracts verified facts, and assesses real-world impact.",
    color: "var(--accent-cyan)",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
    border: "rgba(6,182,212,0.3)",
    glow: "rgba(6,182,212,0.1)",
    features: ["Claim verification", "Bias detection", "Impact assessment", "Timeline extraction"],
    badge: "Fact-Check",
  },
  {
    id: "safetynet",
    icon: ShieldAlert,
    title: "SafetyNet",
    subtitle: "Emergency Response Coordinator",
    description:
      "Process any distress signal, emergency description, or safety concern into a complete, prioritized emergency response action plan.",
    color: "var(--accent-amber)",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    border: "rgba(245,158,11,0.3)",
    glow: "rgba(245,158,11,0.1)",
    features: ["Risk assessment", "Agency routing", "Resource allocation", "Response timeline"],
    badge: "Emergency",
  },
];

const stats = [
  { label: "Response Time", value: "< 3s", icon: Zap },
  { label: "Input Formats", value: "20+", icon: Globe },
  { label: "AI Accuracy", value: "97%+", icon: Brain },
  { label: "Live Uptime", value: "99.9%", icon: Activity },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          borderRadius: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Clear<span className="gradient-text">Path</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {modules.slice(0, 5).map((m) => (
            <Link
              key={m.id}
              href={`/${m.id}`}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {m.title}
            </Link>
          ))}
        </div>
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent-blue)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px var(--accent-green)" }} />
          Gemini Powered
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: "100px 32px 80px",
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--accent-blue)",
              marginBottom: 32,
            }}
          >
            <Brain size={14} />
            Powered by Google Gemini 1.5 Pro
            <ChevronRight size={14} />
          </div>

          <h1
            style={{
              fontSize: "clamp(48px, 7vw, 80px)",
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: 24,
            }}
          >
            From Chaos to
            <br />
            <span className="gradient-text">Clarity</span> in Seconds
          </h1>

          <p
            style={{
              fontSize: 20,
              color: "var(--text-secondary)",
              maxWidth: 660,
              margin: "0 auto 48px",
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            ClearPath is a universal AI bridge that converts messy, unstructured
            real-world inputs—voice, photos, medical records, documents, news—into
            structured, verified, and life-saving intelligence.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/mediscan" className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}>
              <Stethoscope size={18} />
              Start with MediScan
              <ArrowRight size={16} />
            </Link>
            <Link href="/voicebridge" className="btn-secondary" style={{ fontSize: 15, padding: "14px 28px" }}>
              <Mic size={16} />
              Try VoiceBridge
            </Link>
          </div>
          
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <LiveFeed />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 80,
            maxWidth: 700,
            margin: "80px auto 0",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass"
              style={{
                padding: "20px 16px",
                borderRadius: 16,
                textAlign: "center",
              }}
            >
              <stat.icon size={20} color="var(--accent-blue)" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Modules Grid */}
      <section style={{ padding: "40px 32px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Five Intelligent Modules
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
            Each module is purpose-built with specialized Gemini prompts for maximum accuracy
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 24,
          }}
        >
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5 }}
            >
              <Link href={`/${mod.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="glass glass-hover"
                  style={{
                    borderRadius: 20,
                    padding: 28,
                    cursor: "pointer",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* glow bg */}
                  <div
                    style={{
                      position: "absolute",
                      top: -40,
                      right: -40,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: mod.glow,
                      filter: "blur(40px)",
                      pointerEvents: "none",
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: mod.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <mod.icon size={24} color="white" />
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: `${mod.glow}`,
                        color: mod.color,
                        border: `1px solid ${mod.border}`,
                      }}
                    >
                      {mod.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      marginBottom: 4,
                      color: "var(--text-primary)",
                    }}
                  >
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: 13, color: mod.color, fontWeight: 500, marginBottom: 12 }}>
                    {mod.subtitle}
                  </p>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
                    {mod.description}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {mod.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle size={14} color={mod.color} />
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: mod.color,
                    }}
                  >
                    Launch {mod.title}
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          padding: "60px 32px",
          background: "rgba(13,18,32,0.6)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 48 }}>
            How <span className="gradient-text">ClearPath</span> Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { step: "01", title: "Drop Your Input", desc: "Upload files, paste text, record voice, or share a URL. Any format accepted." },
              { step: "02", title: "Gemini Analyzes", desc: "Google Gemini 1.5 Pro processes your input with specialized system prompts for deep understanding." },
              { step: "03", title: "Get Structured Output", desc: "Receive clean, verified, categorized data with risk flags, confidence scores, and action items." },
            ].map((item) => (
              <div key={item.step} style={{ padding: "24px 20px" }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: "var(--gradient-primary)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 16,
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 32px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <p>
          Built with{" "}
          <span className="gradient-text" style={{ fontWeight: 600 }}>Google Gemini</span>
          {" "}· ClearPath — Universal AI Bridge for Social Good
        </p>
      </footer>
    </main>
  );
}
