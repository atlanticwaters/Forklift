import React, { useEffect } from "react";

interface Props {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  onDismiss: () => void;
}

export function StatusBar({ state, message, onDismiss }: Props) {
  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, onDismiss]);

  if (state === "idle") return null;

  const bgColor =
    state === "loading"
      ? "#fff3cd"
      : state === "success"
        ? "#d4edda"
        : "#f8d7da";
  const textColor =
    state === "loading"
      ? "#856404"
      : state === "success"
        ? "#155724"
        : "#721c24";

  return (
    <div
      style={{
        padding: "8px 12px",
        fontSize: "11px",
        fontWeight: 500,
        background: bgColor,
        color: textColor,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{message}</span>
      {state !== "loading" && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: textColor,
            cursor: "pointer",
            fontSize: "13px",
            lineHeight: 1,
            padding: "0 0 0 8px",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
