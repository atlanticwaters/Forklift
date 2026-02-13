import { findImageFillNode, findThumbnailFillNodes } from "./nodeTraversal";

/**
 * Create a Figma image from raw bytes and return the IMAGE fill paint.
 */
function createImageFill(imageBytes: number[]): ImagePaint {
  const bytes = new Uint8Array(imageBytes);
  const image = figma.createImage(bytes);
  return {
    type: "IMAGE",
    scaleMode: "FILL",
    imageHash: image.hash,
  };
}

/**
 * Apply an image fill to a single GeometryMixin node.
 */
function applyFillToNode(node: GeometryMixin, fill: ImagePaint): void {
  node.fills = [fill];
}

/**
 * Apply image bytes to the hero Product Image layer (Product Media > Image).
 */
export async function setHeroImageFill(
  root: SceneNode & ChildrenMixin,
  imageBytes: number[]
): Promise<void> {
  const fillNode = findImageFillNode(root);
  if (!fillNode) return;
  applyFillToNode(fillNode, createImageFill(imageBytes));
}

/**
 * Apply image bytes to the SKU thumbnail tiles (up to 5).
 * Each entry in `thumbnailByteArrays` corresponds to one tile slot.
 */
export async function setThumbnailFills(
  root: SceneNode & ChildrenMixin,
  thumbnailByteArrays: Array<number[]>
): Promise<void> {
  const tileNodes = findThumbnailFillNodes(root);
  const count = Math.min(tileNodes.length, thumbnailByteArrays.length);
  for (let i = 0; i < count; i++) {
    applyFillToNode(tileNodes[i], createImageFill(thumbnailByteArrays[i]));
  }
}

// Keep backward-compatible alias
export const setImageFill = setHeroImageFill;
