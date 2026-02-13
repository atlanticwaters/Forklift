import { useState, useEffect, useCallback } from "react";
import type { PluginMessage } from "../../shared/types";

interface SelectionState {
  count: number;
  hasProductPods: boolean;
}

interface PopulateStatus {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  progress?: { current: number; total: number };
}

export function usePluginMessaging() {
  const [selection, setSelection] = useState<SelectionState>({
    count: 0,
    hasProductPods: false,
  });
  const [status, setStatus] = useState<PopulateStatus>({
    state: "idle",
    message: "",
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data.pluginMessage as PluginMessage | undefined;
      if (!msg) return;

      switch (msg.type) {
        case "selection-update":
          setSelection({
            count: msg.count,
            hasProductPods: msg.hasProductPods,
          });
          break;
        case "populate-progress":
          setStatus({
            state: "loading",
            message: `Populating ${msg.current}/${msg.total}...`,
            progress: { current: msg.current, total: msg.total },
          });
          break;
        case "populate-success":
          setStatus({
            state: "success",
            message: `Populated ${msg.count} pod${msg.count > 1 ? "s" : ""}`,
          });
          break;
        case "populate-error":
          setStatus({ state: "error", message: msg.message });
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const postMessage = useCallback((msg: PluginMessage) => {
    parent.postMessage({ pluginMessage: msg }, "*");
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({ state: "idle", message: "" });
  }, []);

  return { selection, status, postMessage, resetStatus };
}
