import { findChildByName } from "./nodeTraversal";

/** Cache of loaded font names to avoid redundant loads */
const loadedFonts = new Set<string>();

/**
 * Load a font if not already loaded. Falls back to "Inter" Regular if the
 * target font fails.
 */
async function ensureFont(fontName: FontName): Promise<void> {
  const key = `${fontName.family}::${fontName.style}`;
  if (loadedFonts.has(key)) return;
  try {
    await figma.loadFontAsync(fontName);
    loadedFonts.add(key);
  } catch {
    // Fallback to Inter Regular
    const fallback: FontName = { family: "Inter", style: "Regular" };
    const fbKey = `${fallback.family}::${fallback.style}`;
    if (!loadedFonts.has(fbKey)) {
      await figma.loadFontAsync(fallback);
      loadedFonts.add(fbKey);
    }
  }
}

/**
 * Load fonts used by a text node and set its characters.
 */
export async function setTextOnNode(
  textNode: TextNode,
  value: string
): Promise<void> {
  if (textNode.fontName !== figma.mixed) {
    await ensureFont(textNode.fontName);
  } else {
    // Mixed fonts — load font for each segment
    const len = textNode.characters.length;
    if (len > 0) {
      const seen = new Set<string>();
      for (let i = 0; i < len; i++) {
        const fn = textNode.getRangeFontName(i, i + 1) as FontName;
        const key = `${fn.family}::${fn.style}`;
        if (!seen.has(key)) {
          seen.add(key);
          await ensureFont(fn);
        }
      }
    }
  }
  textNode.characters = value;
}

/**
 * Set a text node's characters by layer name (recursive search).
 * Gracefully skips if the layer doesn't exist or isn't a text node.
 */
export async function setTextContent(
  root: SceneNode & ChildrenMixin,
  layerName: string,
  value: string
): Promise<void> {
  const node = findChildByName(root, layerName);
  if (!node || node.type !== "TEXT") return;
  await setTextOnNode(node, value);
}

/**
 * Set visibility of a frame/group layer by name.
 */
export function setLayerVisibility(
  root: SceneNode & ChildrenMixin,
  layerName: string,
  visible: boolean
): void {
  const node = findChildByName(root, layerName);
  if (node) {
    node.visible = visible;
  }
}
