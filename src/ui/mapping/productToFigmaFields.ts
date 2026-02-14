import type { CatalogProduct, ProductPodFields } from "../../shared/types";
import { ratingToStarFills } from "../../sandbox/starRating";

/** Max number of SKU thumbnail slots in the Product Pod */
const MAX_THUMBNAILS = 5;

/**
 * Convert a CatalogProduct from the Orange-Catalog API into
 * the fields needed to populate a Product Pod instance.
 */
export async function mapProductToFields(
  product: CatalogProduct
): Promise<ProductPodFields> {
  // Resolve hero image URL (prefer medium > large > primary)
  const imageUrl =
    product.images?.medium || product.images?.large || product.images?.primary || null;

  // Build thumbnail URLs: prefer gallery images, fall back to primary thumbnail
  const thumbnailUrls: string[] = [];
  if (product.images?.thumbnail) {
    thumbnailUrls.push(product.images.thumbnail);
  }
  const gallery = product.images?.gallery || [];
  for (const url of gallery) {
    if (thumbnailUrls.length >= MAX_THUMBNAILS) break;
    // Convert gallery 600px URLs to 100px thumbnails for smaller transfer
    const thumbUrl = url.replace(/_600\./, "_100.");
    if (!thumbnailUrls.includes(thumbUrl)) {
      thumbnailUrls.push(thumbUrl);
    }
  }

  // Price breakdown
  const currentPrice = product.price?.current ?? 0;
  const dollars = Math.floor(currentPrice);
  const cents = Math.round((currentPrice % 1) * 100);

  // Specifications -> KPF entries (first 3)
  const specEntries = Object.entries(product.specifications || {});
  const kpfEntries = specEntries.slice(0, 3).map(([label, value]) => ({
    label,
    value,
  }));

  // Star rating
  const avg = product.rating?.average ?? 0;
  const starFillStates = ratingToStarFills(avg);

  return {
    brandName: product.brand || "",
    productTitle: product.title || "",
    modelNumber: product.modelNumber ? `Model# ${product.modelNumber}` : "",
    imageUrl,
    thumbnailUrls: thumbnailUrls.slice(0, MAX_THUMBNAILS),
    badge1Text: product.badges?.[0] ?? null,
    badge2Text: product.badges?.[1] ?? null,
    starFillStates,
    ratingAverage: avg > 0 ? avg.toFixed(1) : "0.0",
    reviewCount:
      product.rating?.count > 0
        ? `(${product.rating.count.toLocaleString()})`
        : "(0)",
    priceDollars: dollars.toLocaleString(),
    priceCents: String(cents).padStart(2, "0"),
    wasPrice: null,
    showPickup: product.availability?.inStock ?? false,
    deliveryText: product.availability?.inStock
      ? "Delivery available"
      : "Unavailable",
    kpfEntries,
    buttonLabel: "Add to Cart",
  };
}
