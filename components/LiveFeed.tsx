"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock } from "lucide-react";

export default function LiveFeed() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, "client_events"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(newEvents);
    }, (error) => {
      console.warn("Firebase LiveFeed error (expected if missing credentials):", error);
    });

    return () => unsubscribe();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="section-card" style={{ marginTop: 20, borderColor: "rgba(59,130,246,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div className="pulse-red" style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
          Global Live Feed (Firestore Real-time)
        </h3>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {events.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(5,8,16,0.5)",
                borderRadius: 8,
                borderLeft: `2px solid ${evt.module === "safetynet" ? "#f59e0b" : evt.module === "mediscan" ? "#ef4444" : "#3b82f6"}`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Activity size={14} color="var(--text-secondary)" />
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  {evt.module.toUpperCase()}: <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>{evt.action}</span>
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={10} /> Just now
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
