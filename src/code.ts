import type { PluginMessage } from "./shared/types";
import { UI_WIDTH, UI_HEIGHT } from "./shared/constants";
import { findSelectedProductPods } from "./sandbox/nodeTraversal";
import { populateSingle, populateBatch } from "./sandbox/batchFiller";

figma.showUI(__html__, { width: UI_WIDTH, height: UI_HEIGHT });

// ── Send selection state to UI ──

function emitSelection(): void {
  const pods = findSelectedProductPods();
  const msg: PluginMessage = {
    type: "selection-update",
    count: pods.length,
    hasProductPods: pods.length > 0,
  };
  figma.ui.postMessage(msg);
}

// Fire on initial load + whenever selection changes
emitSelection();
figma.on("selectionchange", emitSelection);

// ── Handle messages from UI ──

figma.ui.onmessage = async (msg: PluginMessage) => {
  switch (msg.type) {
    case "get-selection":
      emitSelection();
      break;
    case "populate-single":
      await populateSingle(msg.fields);
      break;
    case "populate-batch":
      await populateBatch(msg.items);
      break;
  }
};
