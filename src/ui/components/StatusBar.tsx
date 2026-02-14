import React, { useEffect, useState, useRef, memo } from "react";
// @ts-ignore — esbuild resolves .svg imports as data URLs
import forkliftLoadedSrc from "../forklift.svg";
// @ts-ignore
import forkliftEmptySrc from "../forklift_empty.svg";

interface Props {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  onDismiss: () => void;
}

const ICON_SIZE = 23;
const OFFSCREEN_LEFT = `${-(ICON_SIZE + 4)}px`;
const CYCLE_DURATION = "3.2s";

const ANIMATION_CSS = `
@keyframes forklift-empty-lr {
  0%   { left: ${OFFSCREEN_LEFT}; }
  45%  { left: 100%; }
  100% { left: 100%; }
}
@keyframes forklift-loaded-rl {
  0%   { left: 100%; }
  50%  { left: 100%; }
  95%  { left: ${OFFSCREEN_LEFT}; }
  100% { left: ${OFFSCREEN_LEFT}; }
}
@keyframes forklift-exit-left {
  0%   { left: 50%; }
  100% { left: ${OFFSCREEN_LEFT}; }
}
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  const style = document.createElement("style");
  style.textContent = ANIMATION_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

type InternalPhase = "idle" | "loading" | "completing" | "success" | "error";

/**
 * Pure animation component — only re-renders when phase changes,
 * not when the status message text updates.
 */
const ForkliftAnimation = memo(function ForkliftAnimation({
  phase,
}: {
  phase: InternalPhase;
}) {
  useEffect(() => {
    injectCSS();
  }, []);

  if (phase !== "loading" && phase !== "completing") return null;

  return (
    <div style={styles.track}>
      {phase === "loading" && (
        <>
          <img
            src={forkliftEmptySrc}
            alt=""
            style={{
              ...styles.forkliftIcon,
              animation: `forklift-empty-lr ${CYCLE_DURATION} ease-in-out infinite`,
            }}
          />
          <img
            src={forkliftLoadedSrc}
            alt=""
            style={{
              ...styles.forkliftIcon,
              animation: `forklift-loaded-rl ${CYCLE_DURATION} ease-in-out infinite`,
            }}
          />
        </>
      )}
      {phase === "completing" && (
        <img
          src={forkliftLoadedSrc}
          alt=""
          style={{
            ...styles.forkliftIcon,
            animation: "forklift-exit-left 0.8s ease-in forwards",
          }}
        />
      )}
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
    height: "27px",
    overflow: "hidden",
  },
  forkliftIcon: {
    position: "absolute" as const,
    top: "2px",
    height: `${ICON_SIZE}px`,
    width: `${ICON_SIZE}px`,
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
