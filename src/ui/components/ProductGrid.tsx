import React, { useState, useCallback } from "react";
import type { CatalogProduct } from "../../shared/types";
import { ProductCard } from "./ProductCard";

interface Props {
  products: CatalogProduct[];
  loading: boolean;
  batchMode: boolean;
  hasProductPods: boolean;
  onUseSingle: (product: CatalogProduct) => void;
  onUseBatch: (products: CatalogProduct[]) => void;
}

export function ProductGrid({
  products,
  loading,
  batchMode,
  hasProductPods,
  onUseSingle,
  onUseBatch,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (loading) {
    return <div style={styles.message}>Loading products...</div>;
  }

  if (products.length === 0) {
    return <div style={styles.message}>No products found</div>;
  }

  const selectedProducts = products.filter((p) => selectedIds.has(p.productId));

  return (
    <div style={styles.container}>
      {batchMode && selectedProducts.length > 0 && (
        <div style={styles.batchBar}>
          <span>{selectedProducts.length} selected</span>
          <button
            style={styles.batchBtn}
            disabled={!hasProductPods}
            onClick={() => onUseBatch(selectedProducts)}
          >
            Populate {selectedProducts.length}
          </button>
        </div>
      )}
      <div style={styles.list}>
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            batchMode={batchMode}
            selected={selectedIds.has(product.productId)}
            onUse={() => onUseSingle(product)}
            onToggleSelect={() => toggleSelect(product.productId)}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
    overflowY: "auto" as const,
  },
  message: {
    padding: "24px",
    textAlign: "center" as const,
    color: "#999",
    fontSize: "12px",
  },
  batchBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    background: "#f0f8ff",
    borderBottom: "1px solid #d0e8ff",
    fontSize: "11px",
    fontWeight: 500 as const,
    color: "#333",
  },
  batchBtn: {
    padding: "5px 14px",
    fontSize: "11px",
    fontWeight: 600 as const,
    background: "#0d99ff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
