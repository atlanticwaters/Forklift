import React from "react";
import type { CatalogProduct } from "../../shared/types";

interface Props {
  product: CatalogProduct;
  selected?: boolean;
  onUse: () => void;
  onToggleSelect?: () => void;
  batchMode?: boolean;
}

export function ProductCard({
  product,
  selected,
  onUse,
  onToggleSelect,
  batchMode,
}: Props) {
  const imgSrc = product.images?.thumbnail || product.images?.small || "";
  const price = product.price?.current ?? 0;
  const dollars = Math.floor(price);
  const cents = String(Math.round((price % 1) * 100)).padStart(2, "0");
  const rating = product.rating?.average ?? 0;

  return (
    <div
      style={{
        ...styles.card,
        ...(selected ? styles.selected : {}),
      }}
    >
      {batchMode && (
        <div style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
          />
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={product.title}
          style={styles.image}
          loading="lazy"
        />
      )}
      <div style={styles.info}>
        <div style={styles.brand}>{product.brand}</div>
        <div style={styles.title}>{product.title}</div>
        <div style={styles.priceRow}>
          <span style={styles.dollar}>${dollars}</span>
          <span style={styles.cents}>{cents}</span>
          {rating > 0 && (
            <span style={styles.rating}>
              {"★".repeat(Math.round(rating))} {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      {!batchMode && (
        <button style={styles.useBtn} onClick={onUse}>
          Use
        </button>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
  },
  selected: {
    background: "#e8f4ff",
  },
  checkboxRow: {
    flexShrink: 0,
  },
  image: {
    width: "48px",
    height: "48px",
    objectFit: "contain" as const,
    borderRadius: "4px",
    background: "#f9f9f9",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    fontSize: "10px",
    fontWeight: 600 as const,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
  },
  title: {
    fontSize: "11px",
    color: "#333",
    lineHeight: "1.3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
    marginTop: "2px",
  },
  dollar: {
    fontSize: "13px",
    fontWeight: 700 as const,
    color: "#333",
  },
  cents: {
    fontSize: "10px",
    fontWeight: 600 as const,
    color: "#333",
    verticalAlign: "super",
  },
  rating: {
    fontSize: "10px",
    color: "#f5a623",
    marginLeft: "6px",
  },
  useBtn: {
    padding: "4px 12px",
    fontSize: "11px",
    fontWeight: 600 as const,
    background: "#0d99ff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
};
