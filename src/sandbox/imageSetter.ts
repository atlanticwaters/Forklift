import { findImageFillNode, findThumbnailFillNodes } from "./nodeTraversal";

/**
 * Use figma.createImageAsync to load an image from a URL.
 * This fetches through Figma's infrastructure, bypassing CORS entirely.
 */
async function createImageFillFromUrl(url: string): Promise<ImagePaint> {
  const image = await figma.createImageAsync(url);
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
 * Fetch and apply an image to the hero Product Image layer (Product Media > Image).
 */
export async function setHeroImageFill(
  root: SceneNode & ChildrenMixin,
  imageUrl: string
): Promise<void> {
  const fillNode = findImageFillNode(root);
  if (!fillNode) return;
  const fill = await createImageFillFromUrl(imageUrl);
  applyFillToNode(fillNode, fill);
}

/**
 * Fetch and apply images to the SKU thumbnail tiles (up to 5).
 * Each entry in `thumbnailUrls` corresponds to one tile slot.
 */
export async function setThumbnailFills(
  root: SceneNode & ChildrenMixin,
  thumbnailUrls: string[]
): Promise<void> {
  const tileNodes = findThumbnailFillNodes(root);
  const count = Math.min(tileNodes.length, thumbnailUrls.length);
  for (let i = 0; i < count; i++) {
    try {
      const fill = await createImageFillFromUrl(thumbnailUrls[i]);
      applyFillToNode(tileNodes[i], fill);
    } catch {
      // Skip thumbnails that fail to load
    }
  }
}

// Keep backward-compatible alias
export const setImageFill = setHeroImageFill;
