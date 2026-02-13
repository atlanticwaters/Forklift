import React from "react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <div style={styles.container}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={styles.separator}>/</span>}
          {item.onClick ? (
            <button onClick={item.onClick} style={styles.link}>
              {item.label}
            </button>
          ) : (
            <span style={styles.current}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 12px",
    fontSize: "11px",
    color: "#999",
    borderBottom: "1px solid #e5e5e5",
    flexWrap: "wrap" as const,
  },
  separator: { color: "#ccc" },
  link: {
    background: "none",
    border: "none",
    color: "#0d99ff",
    cursor: "pointer",
    padding: 0,
    fontSize: "11px",
  },
  current: {
    color: "#333",
    fontWeight: 500 as const,
  },
};
