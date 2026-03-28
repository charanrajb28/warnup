// @ts-nocheck
"use client";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Trash2 } from "lucide-react";

interface FollowUpChatProps {
  moduleName: string;
  contextData: any; // Using generalized typing for any of the 5 results
  color?: string;
}

export default function FollowUpChat({ moduleName, contextData, color = "#3b82f6" }: FollowUpChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      moduleName,
      contextData,
    },
    onError: (e: Error) => {
      console.error("[Chat Error]", e);
    },
  });

  // Scroll to bottom effortlessly when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen((prev) => !prev);
  const clearChat = () => setMessages([]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          color: "white",
          border: "none",
          boxShadow: `0 8px 32px ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 40,
        }}
        aria-label="Open AI follow-up chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: 380,
              height: 550,
              maxHeight: "calc(100vh - 120px)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", background: "rgba(5,8,16,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ padding: 6, background: `${color}20`, borderRadius: 8, color }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Follow-Up AI</h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ask about this {moduleName} brief</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {messages.length > 0 && (
                  <button onClick={clearChat} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }} title="Clear Chat">
                    <Trash2 size={14} />
                  </button>
                )}
                <button onClick={toggleChat} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div aria-live="polite" aria-atomic="false" style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                  <MessageSquare size={32} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                  <p style={{ fontSize: 13 }}>Ask follow-up questions about this intel report.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: m.role === "user" ? "rgba(255,255,255,0.1)" : `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: m.role === "user" ? "var(--text-primary)" : color }}>
                      {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div style={{ padding: "10px 14px", borderRadius: 12, background: m.role === "user" ? "rgba(255,255,255,0.05)" : "transparent", border: m.role === "user" ? "1px solid var(--border)" : "none", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)", maxWidth: "80%", wordBreak: "break-word" }}>
                      {m.content.split("\\n").map((line, i) => (
                        <p key={i} style={{ margin: "0 0 6px 0" }}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                    <Bot size={14} />
                  </div>
                  <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} style={{ padding: 14, borderTop: "1px solid var(--border)", background: "rgba(5,8,16,0.5)", display: "flex", gap: 8 }}>
              <input
                aria-label="Chat input message"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your question..."
                style={{ flex: 1, background: "rgba(5,8,16,0.6)", border: "1px solid var(--border)", borderRadius: 20, padding: "10px 16px", fontSize: 13, color: "white", outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = `${color}80`)}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <button type="submit" aria-label="Send message" disabled={isLoading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 20, background: input.trim() ? color : "var(--bg)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", opacity: input.trim() ? 1 : 0.5, transition: "all 0.2s" }}>
                <Send size={16} style={{ marginLeft: -2 }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
