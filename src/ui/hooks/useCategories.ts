import { useState, useEffect } from "react";
import type { CategoryIndex } from "../../shared/types";
import { fetchJson } from "../api/client";
import { categoryIndexUrl } from "../api/endpoints";

export function useCategories() {
  const [index, setIndex] = useState<CategoryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJson<CategoryIndex>(categoryIndexUrl())
      .then((data) => {
        if (!cancelled) {
          setIndex(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { index, loading, error };
}
