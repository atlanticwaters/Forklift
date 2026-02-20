import React, { useEffect, useState, useRef } from "react";

interface Props {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  progress?: { current: number; total: number };
  onDismiss: () => void;
}

type InternalPhase =
  | "idle"
  | "loading"
  | "completing"
  | "success"
  | "dismissing"
  | "error";

const ENTER_MS = 400;
const DISMISS_MS = 500;

export function StatusBar({ state, message, progress, onDismiss }: Props) {
  const [phase, setPhase] = useState<InternalPhase>("idle");
  const [entering, setEntering] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const prevState = useRef(state);

  // Kick off the fade-out, then call the real onDismiss when it finishes
  const startDismiss = useRef(() => {
    setPhase("dismissing");
    setTimeout(onDismiss, DISMISS_MS);
  });

  // Phase transitions
  useEffect(() => {
    const prev = prevState.current;
    prevState.current = state;

    if (state === "loading") {
      // Trigger entrance animation when coming from idle
      if (prev === "idle") {
        setEntering(true);
        setTimeout(() => setEntering(false), ENTER_MS);
      }
      setPhase("loading");
      return;
    }

    if (state === "success" && prev === "loading") {
      setPhase("completing");
      setBarWidth(100);
      const timer = setTimeout(() => setPhase("success"), 600);
      return () => clearTimeout(timer);
    }

    if (state === "success") {
      setPhase("success");
      return;
    }

    if (state === "error") {
      setPhase("error");
      return;
    }

    setPhase("idle");
    setBarWidth(0);
  }, [state]);

  // Drive bar width from progress
  useEffect(() => {
    if (phase === "loading" && progress) {
      const pct = Math.round((progress.current / progress.total) * 100);
      setBarWidth(pct);
    } else if (phase === "loading" && !progress) {
      setBarWidth(30);
    }
  }, [phase, progress]);

  // Auto-dismiss on success (with animated exit)
  useEffect(() => {
    if (phase === "success") {
      const timer = setTimeout(() => startDismiss.current(), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "idle") return null;

  const isAnimating = phase === "loading" || phase === "completing";
  const isDismissing = phase === "dismissing";
  const pctLabel =
    progress && phase === "loading"
      ? `${progress.current}/${progress.total}`
      : phase === "completing"
        ? "Done!"
        : null;

  const wrapperStyle = {
    ...styles.wrapper,
    ...(entering ? styles.wrapperEntering : undefined),
    ...(isDismissing ? styles.wrapperDismissing : undefined),
  };

  return (
    <div style={wrapperStyle}>
      {/* Progress bar track */}
      {isAnimating && (
        <div style={styles.track}>
          <div
            style={{
              ...styles.bar,
              width: `${barWidth}%`,
              background:
                phase === "completing" ? "#34c759" : "#0d99ff",
            }}
          />
        </div>
      )}

      {/* Text row */}
      <div
        style={{
          ...styles.textRow,
          background:
            isAnimating || isDismissing
              ? isDismissing
                ? "#d4edda"
                : "transparent"
              : phase === "success"
                ? "#d4edda"
                : "#f8d7da",
          color:
            isAnimating
              ? "#666"
              : phase === "success" || isDismissing
                ? "#155724"
                : "#721c24",
          borderRadius: "6px",
        }}
      >
        <span style={styles.message}>
          {phase === "success" || isDismissing
            ? "Sync complete!"
            : message}
        </span>
        <span style={styles.right}>
          {pctLabel && <span style={styles.pctLabel}>{pctLabel}</span>}
          {(phase === "success" || phase === "error") && (
            <button
              onClick={() => startDismiss.current()}
              style={{
                ...styles.dismissBtn,
                color: phase === "success" ? "#155724" : "#721c24",
              }}
            >
              ×
            </button>
          )}
        </span>
      </div>

      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `
@keyframes statusbar-fade-in {
  from {
    opacity: 0;
    max-height: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
  }
  to {
    opacity: 1;
    max-height: 60px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
@keyframes statusbar-fade-out {
  from {
    opacity: 1;
    max-height: 60px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  to {
    opacity: 0;
    max-height: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
  }
}
`;

const styles = {
  wrapper: {
    padding: "8px 20px",
    borderBottom: "1px solid #e5e5e5",
    overflow: "hidden" as const,
  },
  wrapperEntering: {
    animation: `statusbar-fade-in ${ENTER_MS}ms ease forwards`,
  },
  wrapperDismissing: {
    animation: `statusbar-fade-out ${DISMISS_MS}ms ease forwards`,
    borderBottomColor: "transparent",
  },
  track: {
    position: "relative" as const,
    width: "100%",
    height: "4px",
    background: "#e5e5e5",
    overflow: "hidden" as const,
    borderRadius: "2px",
  },
  bar: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: "0 2px 2px 0",
    transition: "width 0.4s ease, background 0.3s ease",
  },
  textRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 12px",
    fontSize: "11px",
    fontWeight: 500 as const,
  },
  message: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
  },
  pctLabel: {
    fontSize: "10px",
    fontWeight: 600 as const,
    opacity: 0.7,
  },
  dismissBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: 1,
    padding: "0 0 0 4px",
  },
} as const;
