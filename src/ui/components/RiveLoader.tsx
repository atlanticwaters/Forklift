import React from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
// @ts-ignore — esbuild resolves .riv imports as data URLs
import forkliftRiv from "../forklift_loader.riv";

interface Props {
  message?: string;
}

export function RiveLoader({ message }: Props) {
  const { RiveComponent } = useRive({
    src: forkliftRiv,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  return (
    <div style={styles.container}>
      <div style={styles.canvasWrap}>
        <RiveComponent style={styles.canvas} />
      </div>
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    gap: "8px",
  },
  canvasWrap: {
    width: "80px",
    height: "80px",
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
  message: {
    fontSize: "11px",
    color: "#999",
    textAlign: "center" as const,
  },
} as const;
