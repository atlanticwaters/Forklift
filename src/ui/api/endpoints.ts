import { API_BASE_URL } from "../../shared/constants";

export function categoryIndexUrl(): string {
  return `${API_BASE_URL}/categories/index.json`;
}

/**
 * Build URL for a category's products file.
 * Supports 1-3 level paths, e.g. "tools", "tools/drills", "tools/drills/hammer-drills"
 */
export function categoryProductsUrl(slugPath: string): string {
  return `${API_BASE_URL}/categories/${slugPath}.json`;
}

export function summaryUrl(): string {
  return `${API_BASE_URL}/SUMMARY.json`;
}
