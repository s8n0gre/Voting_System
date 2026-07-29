import { useState, useCallback } from "react";

interface ToastMessage {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

let toastCounter = 0;
const listeners = new Set<(toast: ToastMessage) => void>();

/** Call this anywhere to fire a toast */
export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  const toast: ToastMessage = { id: ++toastCounter, type, message };
  listeners.forEach((fn) => fn(toast));
}

const iconMap = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  }, []);

  // Register listener once
  useState(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  });

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.75rem 1.125rem",
            borderRadius: "0.75rem",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid",
            fontSize: "0.875rem",
            fontWeight: 500,
            pointerEvents: "auto",
            animation: "fadeUp 0.3s ease forwards",
            maxWidth: "340px",
            lineHeight: 1.4,
            ...(t.type === "success"
              ? {
                  background: "rgba(34, 197, 94, 0.12)",
                  borderColor: "rgba(34, 197, 94, 0.3)",
                  color: "#4ade80",
                }
              : t.type === "error"
              ? {
                  background: "rgba(244, 63, 94, 0.12)",
                  borderColor: "rgba(244, 63, 94, 0.3)",
                  color: "#fb7185",
                }
              : {
                  background: "rgba(139, 92, 246, 0.12)",
                  borderColor: "rgba(139, 92, 246, 0.3)",
                  color: "#a78bfa",
                }),
          }}
        >
          {iconMap[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default Toast;
