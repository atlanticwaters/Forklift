export const API_BASE_URL =
  "https://atlanticwaters.github.io/Orange-Catalog/production%20data";

/** Layer names used in Product Pod component instances (from Figma design context) */
export const LAYER_NAMES = {
  // Structural containers
  POD_HEADER: "Pod Header (Slot 1)",
  POD_BODY: "Pod Body (Slot 2)",
  PRODUCT_DETAILS: "Product Details",
  PRODUCT_OVERVIEW: "Product Overview",

  // Text container layers (contain text children by position)
  PRODUCT_LABELS: "Product Labels",
  MAIN_PRICE: "Main Price",
  MAIN_PRICE_INFO: "Main Price Info",
  DISCOUNT_PRICE: "Discount Price",
  EYEBROW_LABEL: "Eyebrow Label",
  BULK_TEXT: "Bulk Text",

  // Button
  POD_ACTIONS: "Pod Actions",
  BUTTON: "Button",
  BUTTON_TITLE: "Button title",

  // Hero image
  PRODUCT_MEDIA: "Product Media",
  IMAGE: "Image",

  // SKU Thumbnail tiles (5 slots)
  SKU_SELECTOR: "SKU Selector",
  SKU_OPTIONS: "SKU Options",
  TILE_GROUP: "Tile Group",
  TILE: "Tile",
  TILE_BASE: ".Tile Base",
  COL_LEFT: "col-left",

  // Rating
  BETA_RATING: "BETA Rating",
  STARS: "Stars",

  // Badges
  BADGE_GROUP: "Badge Group",
  BADGE: "Badge",
  LABEL_CONTAINER: "Label Container",
  PROMO_BADGE: "Promo Badge",

  // Fulfillment
  FULFILLMENT_OPTIONS: "BETA Fulfillment Options",
  FULFILLMENT_PICKUP: "BETA Fulfillment - Pickup",
  FULFILLMENT_DELIVERY: "BETA Fulfillment - Delivery",
  FULFILLMENT_AISLE_BAY: "BETA Fulfillment - Aisle & Bay",
  FULFILLMENT_INFO: "Fulfillment Info",
  FULFILLMENT_DETAIL: "Fulfillment Detail",

  // Hyperlink text
  HYPERLINK_TEXT: "Hyperlink Text",
  SECONDARY_HYPERLINK_TEXT: "Secondary Hyperlink Text",

  // Root component name pattern
  PRODUCT_POD: "Product Pod",
} as const;

/** Figma component set name for the Product Pod */
export const PRODUCT_POD_COMPONENT_NAME = "Product Pod";

export const UI_WIDTH = 360;
export const UI_HEIGHT = 560;
