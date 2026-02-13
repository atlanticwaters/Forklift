// ── Orange-Catalog product (compact schema from category listing files) ──

export interface CatalogProduct {
  productId: string;
  modelNumber: string;
  brand: string;
  title: string;
  subcategory: string;
  description: string;
  warranty: string;
  plpTileType: string;
  rating: {
    average: number;
    count: number;
  };
  images: {
    primary: string;
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    gallery: string[];
  };
  badges: string[];
  availability: {
    inStock: boolean;
  };
  price: {
    current: number;
    currency: string;
  };
  specifications: Record<string, string>;
  highlights: string[];
  questionsAndAnswers: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  filterAttributes: Record<string, unknown>;
}

// ── Category tree from index.json ──

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  path?: string;
  subcategories?: CategoryNode[];
}

export interface CategoryIndex {
  version: string;
  lastUpdated: string;
  totalCategories: number;
  totalProducts: number;
  categories: CategoryNode[];
}

export interface CategoryFile {
  categoryId: string;
  name: string;
  slug: string;
  path: string;
  version: string;
  lastUpdated: string;
  breadcrumbs: Array<{ label: string; url: string }>;
  pageInfo: { totalResults: number };
  featuredBrands: Array<{
    brandId: string;
    brandName: string;
    logoUrl: string;
    count: number;
  }>;
  products: CatalogProduct[];
}

// ── Fields that get applied to a Product Pod instance ──

export interface ProductPodFields {
  brandName: string;
  productTitle: string;
  modelNumber: string;
  imageBytes: number[] | null;
  thumbnailByteArrays: Array<number[]>; // up to 5 gallery thumbnails
  badge1Text: string | null;
  badge2Text: string | null;
  starFillStates: Array<"0" | "50" | "100">; // 5 entries
  ratingAverage: string;
  reviewCount: string;
  priceDollars: string;
  priceCents: string;
  wasPrice: string | null;
  showPickup: boolean;
  deliveryText: string;
  kpfEntries: Array<{ label: string; value: string }>;
  buttonLabel: string;
}

// ── Plugin message protocol ──

export type PluginMessage =
  | { type: "populate-single"; fields: ProductPodFields }
  | { type: "populate-batch"; items: ProductPodFields[] }
  | { type: "get-selection" }
  | {
      type: "selection-update";
      count: number;
      hasProductPods: boolean;
    }
  | { type: "populate-progress"; current: number; total: number }
  | { type: "populate-success"; count: number }
  | { type: "populate-error"; message: string };
