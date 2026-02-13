import { useState, useEffect } from "react";
import type { CatalogProduct, CategoryFile } from "../../shared/types";
import { fetchJson } from "../api/client";
import { categoryProductsUrl } from "../api/endpoints";

export function useProducts(slugPath: string | null) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugPath) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchJson<CategoryFile>(categoryProductsUrl(slugPath))
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slugPath]);

  return { products, loading, error };
}
