import React from "react";
import type { CategoryNode } from "../../shared/types";

interface Props {
  departments: CategoryNode[];
  onSelect: (dept: CategoryNode) => void;
}

export function DepartmentList({ departments, onSelect }: Props) {
  return (
    <div style={styles.list}>
      {departments.map((dept) => (
        <button
          key={dept.id}
          style={styles.item}
          onClick={() => onSelect(dept)}
        >
          <div style={styles.name}>{dept.name}</div>
          <div style={styles.count}>
            {dept.productCount.toLocaleString()} products
          </div>
        </button>
      ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    border: "none",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  name: {
    fontSize: "13px",
    fontWeight: 500 as const,
    color: "#333",
  },
  count: {
    fontSize: "11px",
    color: "#999",
  },
};
