import React from "react";
import type { CategoryNode } from "../../shared/types";

interface Props {
  categories: CategoryNode[];
  onSelect: (cat: CategoryNode) => void;
  onViewProducts: (cat: CategoryNode) => void;
}

export function CategoryList({ categories, onSelect, onViewProducts }: Props) {
  return (
    <div style={styles.list}>
      {categories.map((cat) => {
        const hasSubs =
          cat.subcategories && cat.subcategories.length > 0;
        return (
          <div key={cat.id} style={styles.item}>
            <button
              style={styles.nameBtn}
              onClick={() => (hasSubs ? onSelect(cat) : onViewProducts(cat))}
            >
              <span style={styles.name}>{cat.name}</span>
              <span style={styles.count}>
                {cat.productCount > 0 && `${cat.productCount}`}
                {hasSubs && " ›"}
              </span>
            </button>
            {hasSubs && cat.productCount > 0 && (
              <button
                style={styles.viewAll}
                onClick={() => onViewProducts(cat)}
              >
                View all
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  list: {
    display: "flex",
    flexDirection: "column" as const,
  },
  item: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #f0f0f0",
  },
  nameBtn: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    border: "none",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  name: {
    fontSize: "12px",
    fontWeight: 500 as const,
    color: "#333",
  },
  count: {
    fontSize: "11px",
    color: "#999",
  },
  viewAll: {
    fontSize: "10px",
    color: "#0d99ff",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 12px 4px 0",
    whiteSpace: "nowrap" as const,
  },
};
