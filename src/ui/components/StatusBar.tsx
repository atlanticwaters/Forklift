import React, { useEffect, useState, useRef, memo } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
// @ts-ignore — esbuild resolves .riv imports as data URLs
import forkliftRiv from "../forklift_loader.riv";

interface Props {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  onDismiss: () => void;
}

type InternalPhase = "idle" | "loading" | "completing" | "success" | "error";

const ForkliftAnimation = memo(function ForkliftAnimation({
  phase,
}: {
  phase: InternalPhase;
}) {
  const { rive, RiveComponent } = useRive({
    src: forkliftRiv,
    autoplay: false,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    if (!rive) return;
    if (phase === "loading") {
      rive.play();
    } else {
      rive.pause();
    }
  }, [rive, phase]);

  if (phase !== "loading" && phase !== "completing") return null;

  return (
    <div style={styles.track}>
      <RiveComponent style={styles.riveCanvas} />
    </div>
  );
});

export function StatusBar({ state, message, onDismiss }: Props) {
  const [phase, setPhase] = useState<InternalPhase>("idle");
  const prevState = useRef(state);

  // Manage internal phase transitions
  useEffect(() => {
    const prev = prevState.current;
    prevState.current = state;

    if (state === "loading") {
      setPhase("loading");
      return;
    }

    if (state === "success" && prev === "loading") {
      setPhase("completing");
      const timer = setTimeout(() => setPhase("success"), 800);
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
  }, [state]);

  // Auto-dismiss on success
  useEffect(() => {
    if (phase === "success") {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onDismiss]);

  if (phase === "idle") return null;

  const isAnimating = phase === "loading" || phase === "completing";

  const bgColor = isAnimating
    ? "transparent"
    : phase === "success"
      ? "#d4edda"
      : "#f8d7da";
  const textColor = isAnimating
    ? "#666"
    : phase === "success"
      ? "#155724"
      : "#721c24";

  return (
    <>
      {/* Animation — isolated from text updates */}
      <ForkliftAnimation phase={phase} />

      {/* Status text — updates freely without affecting animation */}
      <div style={{ ...styles.statusBar, background: bgColor, color: textColor }}>
        {isAnimating && (
          <div style={styles.loadingTextRow}>
            <span style={styles.loadingText}>{message}</span>
          </div>
        )}

        {(phase === "success" || phase === "error") && (
          <div style={styles.textRow}>
            <span>{phase === "success" ? "Loading complete" : message}</span>
            <button
              onClick={onDismiss}
              style={{ ...styles.dismissBtn, color: textColor }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  track: {
    position: "relative" as const,
    width: "100%",
    height: "40px",
    overflow: "hidden",
  },
  riveCanvas: {
    width: "100%",
    height: "100%",
  },
  statusBar: {
    fontSize: "11px",
    fontWeight: 500 as const,
  },
  loadingTextRow: {
    textAlign: "center" as const,
    padding: "2px 12px 4px",
  },
  loadingText: {
    fontSize: "10px",
    opacity: 0.6,
  },
  textRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
  },
  dismissBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: 1,
    padding: "0 0 0 8px",
  },
} as const;
