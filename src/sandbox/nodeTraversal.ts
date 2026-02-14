import { LAYER_NAMES, PRODUCT_POD_COMPONENT_NAME } from "../shared/constants";

/**
 * Check whether a node is a Product Pod instance (by component name).
 */
export function isProductPodInstance(node: SceneNode): node is InstanceNode {
  if (node.type !== "INSTANCE") return false;
  const comp = node.mainComponent;
  if (!comp) return false;

  // Match if the component (or its parent component set) contains "Product Pod"
  const name = comp.parent?.type === "COMPONENT_SET"
    ? comp.parent.name
    : comp.name;
  return name.includes(PRODUCT_POD_COMPONENT_NAME);
}

/**
 * Recursively find a child node by its layer name.
 */
export function findChildByName(
  root: SceneNode & ChildrenMixin,
  name: string
): SceneNode | null {
  for (const child of root.children) {
    if (child.name === name) return child;
    if ("children" in child) {
      const found = findChildByName(child as SceneNode & ChildrenMixin, name);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find all text nodes inside a named container, returned in document order.
 */
export function findTextChildrenInLayer(
  root: SceneNode & ChildrenMixin,
  layerName: string
): TextNode[] {
  const container = findChildByName(root, layerName);
  if (!container) return [];
  const results: TextNode[] = [];
  collectTextNodes(container, results);
  return results;
}

function collectTextNodes(node: SceneNode, results: TextNode[]): void {
  if (node.type === "TEXT") {
    results.push(node);
    return;
  }
  if ("children" in node) {
    for (const child of (node as SceneNode & ChildrenMixin).children) {
      collectTextNodes(child, results);
    }
  }
}

/**
 * Find the image fill node: Product Media > Image > Image.
 * The outer "Image" is a container; the inner "Image" child holds the actual fill.
 */
export function findImageFillNode(
  root: SceneNode & ChildrenMixin
): GeometryMixin | null {
  const mediaFrame = findChildByName(root, LAYER_NAMES.PRODUCT_MEDIA);
  if (!mediaFrame || !("children" in mediaFrame)) return null;

  // Find the outer Image container
  const outerImage = findChildByName(
    mediaFrame as SceneNode & ChildrenMixin,
    LAYER_NAMES.IMAGE
  );
  if (!outerImage || !("children" in outerImage)) return null;

  // Find the inner Image child that holds the fill
  const innerImage = findChildByName(
    outerImage as SceneNode & ChildrenMixin,
    LAYER_NAMES.IMAGE
  );
  if (innerImage && "fills" in innerImage) {
    return innerImage as unknown as GeometryMixin;
  }

  // Fallback to outer Image if no nested child
  if ("fills" in outerImage) {
    return outerImage as unknown as GeometryMixin;
  }

  return null;
}

/**
 * Find all badge containers ("Badge" layers inside "Badge Group").
 */
export function findBadgeContainers(
  root: SceneNode & ChildrenMixin
): Array<SceneNode & ChildrenMixin> {
  const badgeGroup = findChildByName(root, LAYER_NAMES.BADGE_GROUP);
  if (!badgeGroup || !("children" in badgeGroup)) return [];

  return (badgeGroup as FrameNode).children.filter(
    (c): c is SceneNode & ChildrenMixin =>
      c.name === LAYER_NAMES.BADGE && "children" in c
  );
}

/**
 * Find all star instances inside the Stars frame.
 */
export function findStarInstances(
  root: SceneNode & ChildrenMixin
): InstanceNode[] {
  const ratingFrame = findChildByName(root, LAYER_NAMES.BETA_RATING);
  if (!ratingFrame || !("children" in ratingFrame)) return [];

  const starsFrame = findChildByName(
    ratingFrame as SceneNode & ChildrenMixin,
    LAYER_NAMES.STARS
  );
  if (!starsFrame || !("children" in starsFrame)) return [];

  return (starsFrame as FrameNode).children.filter(
    (c): c is InstanceNode => c.type === "INSTANCE"
  );
}

/**
 * Find the image fill nodes for the 5 SKU thumbnail tiles.
 * Path: SKU Selector > SKU Options > Tile Group > Tile > .Tile Base > col-left > Image
 * Returns up to 5 fill-capable nodes in document order.
 */
export function findThumbnailFillNodes(
  root: SceneNode & ChildrenMixin
): GeometryMixin[] {
  const skuSelector = findChildByName(root, LAYER_NAMES.SKU_SELECTOR);
  if (!skuSelector || !("children" in skuSelector)) return [];

  const skuOptions = findChildByName(
    skuSelector as SceneNode & ChildrenMixin,
    LAYER_NAMES.SKU_OPTIONS
  );
  if (!skuOptions || !("children" in skuOptions)) return [];

  const tileGroup = findChildByName(
    skuOptions as SceneNode & ChildrenMixin,
    LAYER_NAMES.TILE_GROUP
  );
  if (!tileGroup || !("children" in tileGroup)) return [];

  const results: GeometryMixin[] = [];
  const tiles = (tileGroup as FrameNode).children.filter(
    (c) => c.name === LAYER_NAMES.TILE
  );

  for (const tile of tiles) {
    if (!("children" in tile)) continue;
    // Walk: Tile > .Tile Base > col-left > Image
    const tileBase = findChildByName(
      tile as SceneNode & ChildrenMixin,
      LAYER_NAMES.TILE_BASE
    );
    if (!tileBase || !("children" in tileBase)) continue;

    const colLeft = findChildByName(
      tileBase as SceneNode & ChildrenMixin,
      LAYER_NAMES.COL_LEFT
    );
    if (!colLeft || !("children" in colLeft)) continue;

    const imageNode = findChildByName(
      colLeft as SceneNode & ChildrenMixin,
      LAYER_NAMES.IMAGE
    );
    if (imageNode && "fills" in imageNode) {
      results.push(imageNode as unknown as GeometryMixin);
    }
  }
  return results;
}

/**
 * Find all Product Pod instances in the current selection.
 */
export function findSelectedProductPods(): InstanceNode[] {
  const selection = figma.currentPage.selection;
  const pods: InstanceNode[] = [];

  for (const node of selection) {
    if (isProductPodInstance(node)) {
      pods.push(node);
    } else if ("children" in node) {
      // Only walk into children for non-pod containers (e.g. frames)
      walkTree(node as SceneNode & ChildrenMixin, pods);
    }
  }
  return pods;
}

function walkTree(
  root: SceneNode & ChildrenMixin,
  results: InstanceNode[]
): void {
  for (const child of root.children) {
    if (isProductPodInstance(child)) {
      results.push(child);
    } else if ("children" in child) {
      walkTree(child as SceneNode & ChildrenMixin, results);
    }
  }
}
