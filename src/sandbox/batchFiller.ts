import type { ProductPodFields, PluginMessage } from "../shared/types";
import { LAYER_NAMES } from "../shared/constants";
import { setTextContent, setTextOnNode, setLayerVisibility } from "./textSetter";
import { setHeroImageFill, setThumbnailFills } from "./imageSetter";
import { setStarRating } from "./starRating";
import {
  findSelectedProductPods,
  findTextChildrenInLayer,
  findBadgeContainers,
  findChildByName,
} from "./nodeTraversal";

/**
 * Fill a single Product Pod instance with the given fields.
 */
export async function fillPod(
  pod: InstanceNode,
  fields: ProductPodFields
): Promise<void> {
  // ── Product Labels (brand, title, model in text children) ──
  const labelTexts = findTextChildrenInLayer(pod, LAYER_NAMES.PRODUCT_LABELS);
  // Typical order: brand (bold), count/separator, model, title, etc.
  // We'll set texts based on their existing font weight to identify brand vs title
  if (labelTexts.length >= 2) {
    // First text is typically brand name
    await setTextOnNode(labelTexts[0], fields.brandName);
    // Last substantial text is typically product title
    await setTextOnNode(labelTexts[labelTexts.length - 1], fields.productTitle);
  } else if (labelTexts.length === 1) {
    await setTextOnNode(labelTexts[0], `${fields.brandName} ${fields.productTitle}`);
  }

  // Model number — search for a text node in labels that contains "Model"
  for (const tn of labelTexts) {
    if (tn.characters.toLowerCase().includes("model")) {
      await setTextOnNode(tn, fields.modelNumber);
      break;
    }
  }

  // ── Pricing (Main Price: $, dollars, cents) ──
  const priceTexts = findTextChildrenInLayer(pod, LAYER_NAMES.MAIN_PRICE);
  if (priceTexts.length >= 3) {
    // [0] = "$", [1] = dollars, [2] = cents
    await setTextOnNode(priceTexts[1], fields.priceDollars);
    await setTextOnNode(priceTexts[2], fields.priceCents);
  } else if (priceTexts.length === 2) {
    await setTextOnNode(priceTexts[0], fields.priceDollars);
    await setTextOnNode(priceTexts[1], fields.priceCents);
  }

  // Was/discount price
  if (fields.wasPrice) {
    setLayerVisibility(pod, LAYER_NAMES.DISCOUNT_PRICE, true);
  }

  // ── Star Rating ──
  await setStarRating(pod, fields.starFillStates);

  // Rating text (inside BETA Rating frame)
  const ratingTexts = findTextChildrenInLayer(pod, LAYER_NAMES.BETA_RATING);
  for (const tn of ratingTexts) {
    const chars = tn.characters.trim();
    // Set the average rating text (looks like "4.5")
    if (/^\d/.test(chars) && chars.length <= 4 && !chars.includes("(")) {
      await setTextOnNode(tn, fields.ratingAverage);
    }
    // Set the review count text (looks like "(548)")
    if (chars.includes("(") || /^\d{2,}$/.test(chars)) {
      await setTextOnNode(tn, fields.reviewCount);
    }
  }

  // ── Badges ──
  const badgeContainers = findBadgeContainers(pod);
  for (let i = 0; i < badgeContainers.length; i++) {
    const badgeText = i === 0 ? fields.badge1Text : fields.badge2Text;
    const container = badgeContainers[i];
    if (badgeText) {
      // Find the label text inside the badge
      const labelNode = findChildByName(container, LAYER_NAMES.LABEL_CONTAINER);
      if (labelNode) {
        const badgeTexts = findTextChildrenInLayer(
          container,
          LAYER_NAMES.LABEL_CONTAINER
        );
        if (badgeTexts.length > 0) {
          await setTextOnNode(badgeTexts[0], badgeText);
        }
        labelNode.visible = true;
      }
    } else {
      // Hide empty badges
      (container as SceneNode).visible = false;
    }
  }

  // ── Fulfillment ──
  const pickupFrame = findChildByName(pod, LAYER_NAMES.FULFILLMENT_PICKUP);
  if (pickupFrame) {
    pickupFrame.visible = fields.showPickup;
  }

  const deliveryFrame = findChildByName(pod, LAYER_NAMES.FULFILLMENT_DELIVERY);
  if (deliveryFrame) {
    deliveryFrame.visible = true;
    // Set the detail text inside the delivery frame
    await setTextContent(pod, LAYER_NAMES.FULFILLMENT_DETAIL, fields.deliveryText);
  }

  // ── KPFs (only present in List/Mini-List variants) ──
  // These are text nodes we try to find; gracefully skip if not present
  for (let i = 0; i < fields.kpfEntries.length && i < 3; i++) {
    const entry = fields.kpfEntries[i];
    // KPF text nodes may be named generically — try known patterns
    const attrNum = i + 1;
    await setTextContent(pod, `Attribute ${attrNum}`, entry.label);
    await setTextContent(pod, `Value ${attrNum}`, entry.value);
  }

  // ── Button ──
  await setTextContent(pod, LAYER_NAMES.BUTTON_TITLE, fields.buttonLabel);

  // ── Images (last since they're the heaviest operations) ──
  if (fields.imageUrl) {
    await setHeroImageFill(pod, fields.imageUrl);
  }
  if (fields.thumbnailUrls && fields.thumbnailUrls.length > 0) {
    await setThumbnailFills(pod, fields.thumbnailUrls);
  }
}

/**
 * Populate a single selected Product Pod.
 */
export async function populateSingle(
  fields: ProductPodFields
): Promise<void> {
  const pods = findSelectedProductPods();
  if (pods.length === 0) {
    const msg: PluginMessage = {
      type: "populate-error",
      message: "No Product Pod instances selected",
    };
    figma.ui.postMessage(msg);
    return;
  }

  try {
    const progressMsg: PluginMessage = {
      type: "populate-progress",
      current: 1,
      total: 1,
    };
    figma.ui.postMessage(progressMsg);

    await fillPod(pods[0], fields);
    const msg: PluginMessage = { type: "populate-success", count: 1 };
    figma.ui.postMessage(msg);
  } catch (err) {
    const msg: PluginMessage = {
      type: "populate-error",
      message: err instanceof Error ? err.message : "Unknown error",
    };
    figma.ui.postMessage(msg);
  }
}

/**
 * Populate multiple selected Product Pods with an array of product data.
 */
export async function populateBatch(
  items: ProductPodFields[]
): Promise<void> {
  const pods = findSelectedProductPods();
  if (pods.length === 0) {
    const msg: PluginMessage = {
      type: "populate-error",
      message: "No Product Pod instances selected",
    };
    figma.ui.postMessage(msg);
    return;
  }

  const count = Math.min(pods.length, items.length);
  for (let i = 0; i < count; i++) {
    const progressMsg: PluginMessage = {
      type: "populate-progress",
      current: i + 1,
      total: count,
    };
    figma.ui.postMessage(progressMsg);

    try {
      await fillPod(pods[i], items[i]);
    } catch (err) {
      const msg: PluginMessage = {
        type: "populate-error",
        message: `Pod ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
      figma.ui.postMessage(msg);
      return;
    }
  }

  const msg: PluginMessage = { type: "populate-success", count };
  figma.ui.postMessage(msg);
}
