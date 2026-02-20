import React from "react";

interface Props {
  message?: string;
}

export function RiveLoader({ message }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      {message && <div style={styles.message}>{message}</div>}
      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `
@keyframes forklift-spin {
  to { transform: rotate(360deg); }
}
`;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    gap: "12px",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #e5e5e5",
    borderTopColor: "#0d99ff",
    borderRadius: "50%",
    animation: "forklift-spin 0.7s linear infinite",
  },
  message: {
    fontSize: "11px",
    color: "#999",
    textAlign: "center" as const,
  },
} as const;
