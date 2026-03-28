import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ClearPath — Gemini AI Universal Bridge",
  description:
    "ClearPath transforms messy, unstructured real-world inputs—voice memos, medical records, documents, news—into structured, verified, life-saving intelligence using Google Gemini AI.",
  keywords: "AI, Gemini, medical, document analysis, voice, emergency, structured data",
  openGraph: {
    title: "ClearPath — Gemini AI Universal Bridge",
    description: "Convert any unstructured input into verified, actionable intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="orb" style={{ width: 600, height: 600, top: -200, left: -200, background: "rgba(59,130,246,0.06)" }} />
        <div className="orb" style={{ width: 500, height: 500, top: "40%", right: -150, background: "rgba(139,92,246,0.06)" }} />
        <div className="orb" style={{ width: 400, height: 400, bottom: -100, left: "30%", background: "rgba(6,182,212,0.04)" }} />
        <div className="noise-overlay" />
        <div className="grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d1220",
              color: "#f1f5f9",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#0d1220" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#0d1220" },
            },
          }}
        />
      </body>
    </html>
  );
}
