"use client";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

interface ModuleLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  backHref?: string;
}

export default function ModuleLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  gradient,
  backHref = "/",
}: ModuleLayoutProps) {
  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Navbar */}
      <nav
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          borderRadius: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href={backHref}
            className="btn-secondary"
            style={{ padding: "7px 14px", fontSize: 13, textDecoration: "none" }}
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} color="white" />
            </div>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              Clear<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Path</span>
            </span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{subtitle}</div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>
        {children}
      </div>
    </main>
  );
}
