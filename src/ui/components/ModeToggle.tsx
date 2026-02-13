import React from "react";

interface Props {
  mode: "single" | "batch";
  onToggle: (mode: "single" | "batch") => void;
}

export function ModeToggle({ mode, onToggle }: Props) {
  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          ...(mode === "single" ? styles.active : {}),
        }}
        onClick={() => onToggle("single")}
      >
        Single
      </button>
      <button
        style={{
          ...styles.button,
          ...(mode === "batch" ? styles.active : {}),
        }}
        onClick={() => onToggle("batch")}
      >
        Batch
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "2px",
    padding: "6px 12px",
    background: "#f5f5f5",
    borderBottom: "1px solid #e5e5e5",
  },
  button: {
    flex: 1,
    padding: "5px 8px",
    fontSize: "11px",
    fontWeight: 500 as const,
    border: "1px solid #ddd",
    borderRadius: "4px",
    background: "#fff",
    color: "#666",
    cursor: "pointer",
  },
  active: {
    background: "#0d99ff",
    color: "#fff",
    borderColor: "#0d99ff",
  },
};
