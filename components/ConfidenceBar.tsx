"use client";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, AlertCircle, XCircle } from "lucide-react";

interface ConfidenceBarProps {
  score: number;
  quality?: string;
}

export default function ConfidenceBar({ score, quality }: ConfidenceBarProps) {
  const pct = Math.round(score * 100);

  const getColor = () => {
    if (pct >= 85) return "#10b981";
    if (pct >= 65) return "#3b82f6";
    if (pct >= 45) return "#f59e0b";
    return "#ef4444";
  };

  const getIcon = () => {
    if (pct >= 85) return <CheckCircle size={14} color="#10b981" />;
    if (pct >= 65) return <AlertTriangle size={14} color="#3b82f6" />;
    if (pct >= 45) return <AlertCircle size={14} color="#f59e0b" />;
    return <XCircle size={14} color="#ef4444" />;
  };

  const getLabel = () => {
    if (pct >= 85) return "High Confidence";
    if (pct >= 65) return "Moderate Confidence";
    if (pct >= 45) return "Low Confidence";
    return "Very Low Confidence";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
          {getIcon()}
          <span style={{ color: getColor() }}>{getLabel()}</span>
          {quality && (
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              · Data Quality: <span style={{ color: "var(--text-secondary)" }}>{quality}</span>
            </span>
          )}
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: getColor() }}>{pct}%</span>
      </div>
      <div className="confidence-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${getColor()}88, ${getColor()})`,
          }}
        />
      </div>
    </div>
  );
}
