import type { CatalogProduct, ProductPodFields } from "../../shared/types";
import { ratingToStarFills } from "../../sandbox/starRating";
import { fetchImageBytes } from "../api/client";

/** Max number of SKU thumbnail slots in the Product Pod */
const MAX_THUMBNAILS = 5;

/**
 * Convert a CatalogProduct from the Orange-Catalog API into
 * the fields needed to populate a Product Pod instance.
 */
export async function mapProductToFields(
  product: CatalogProduct
): Promise<ProductPodFields> {
  // Fetch hero image bytes from the medium/large image URL
  let imageBytes: number[] | null = null;
  const heroUrl =
    product.images?.medium || product.images?.large || product.images?.primary;
  if (heroUrl) {
    try {
      imageBytes = await fetchImageBytes(heroUrl);
    } catch {
      // Hero image fetch failed — continue without image
    }
  }

  // Fetch gallery thumbnail bytes (up to 5, using thumbnail-sized URLs)
  const thumbnailByteArrays: Array<number[]> = [];
  const gallery = product.images?.gallery || [];
  // Build thumbnail URLs: prefer gallery images, fall back to primary thumbnail
  const thumbUrls: string[] = [];
  if (product.images?.thumbnail) {
    thumbUrls.push(product.images.thumbnail);
  }
  for (const url of gallery) {
    if (thumbUrls.length >= MAX_THUMBNAILS) break;
    // Convert gallery 600px URLs to 100px thumbnails for smaller transfer
    const thumbUrl = url.replace(/_600\./, "_100.");
    if (!thumbUrls.includes(thumbUrl)) {
      thumbUrls.push(thumbUrl);
    }
  }

  // Fetch thumbnails in parallel
  const thumbResults = await Promise.allSettled(
    thumbUrls.slice(0, MAX_THUMBNAILS).map((url) => fetchImageBytes(url))
  );
  for (const result of thumbResults) {
    if (result.status === "fulfilled") {
      thumbnailByteArrays.push(result.value);
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
    imageBytes,
    thumbnailByteArrays,
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
