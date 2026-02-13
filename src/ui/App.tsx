import React, { useState, useCallback } from "react";
import type { CategoryNode, CatalogProduct } from "../shared/types";
import { useCategories } from "./hooks/useCategories";
import { useProducts } from "./hooks/useProducts";
import { usePluginMessaging } from "./hooks/usePluginMessaging";
import { mapProductToFields } from "./mapping/productToFigmaFields";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { ModeToggle } from "./components/ModeToggle";
import { StatusBar } from "./components/StatusBar";
import { DepartmentList } from "./components/DepartmentList";
import { CategoryList } from "./components/CategoryList";
import { ProductGrid } from "./components/ProductGrid";

interface NavState {
  level: "departments" | "categories" | "subcategories" | "products";
  department?: CategoryNode;
  category?: CategoryNode;
  subcategory?: CategoryNode;
  productSlug?: string;
}

export function App() {
  const { index, loading: catLoading, error: catError } = useCategories();
  const { selection, status, postMessage, resetStatus } = usePluginMessaging();
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [nav, setNav] = useState<NavState>({ level: "departments" });

  // Derive the slug path for the useProducts hook
  const productSlug = nav.productSlug ?? null;
  const { products, loading: prodLoading } = useProducts(productSlug);

  // ── Navigation ──

  const goHome = useCallback(() => {
    setNav({ level: "departments" });
  }, []);

  const selectDepartment = useCallback((dept: CategoryNode) => {
    if (dept.subcategories && dept.subcategories.length > 0) {
      setNav({ level: "categories", department: dept });
    } else {
      setNav({ level: "products", department: dept, productSlug: dept.slug });
    }
  }, []);

  const selectCategory = useCallback(
    (cat: CategoryNode) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        setNav({
          level: "subcategories",
          department: nav.department,
          category: cat,
        });
      } else {
        const slug = nav.department
          ? `${nav.department.slug}/${cat.slug}`
          : cat.slug;
        setNav({
          level: "products",
          department: nav.department,
          category: cat,
          productSlug: slug,
        });
      }
    },
    [nav.department]
  );

  const viewCategoryProducts = useCallback(
    (cat: CategoryNode) => {
      const slug = nav.department
        ? `${nav.department.slug}/${cat.slug}`
        : cat.slug;
      setNav({
        level: "products",
        department: nav.department,
        category: cat,
        productSlug: slug,
      });
    },
    [nav.department]
  );

  const selectSubcategory = useCallback(
    (sub: CategoryNode) => {
      const slug =
        nav.department && nav.category
          ? `${nav.department.slug}/${nav.category.slug}/${sub.slug}`
          : sub.slug;
      setNav({
        level: "products",
        department: nav.department,
        category: nav.category,
        subcategory: sub,
        productSlug: slug,
      });
    },
    [nav.department, nav.category]
  );

  // ── Product population ──

  const handleUseSingle = useCallback(
    async (product: CatalogProduct) => {
      if (!selection.hasProductPods) return;
      try {
        const fields = await mapProductToFields(product);
        postMessage({ type: "populate-single", fields });
      } catch (err) {
        console.error("Mapping failed:", err);
      }
    },
    [selection.hasProductPods, postMessage]
  );

  const handleUseBatch = useCallback(
    async (selectedProducts: CatalogProduct[]) => {
      if (!selection.hasProductPods) return;
      try {
        const items = await Promise.all(
          selectedProducts.map((p) => mapProductToFields(p))
        );
        postMessage({ type: "populate-batch", items });
      } catch (err) {
        console.error("Batch mapping failed:", err);
      }
    },
    [selection.hasProductPods, postMessage]
  );

  // ── Breadcrumbs ──

  const breadcrumbs: Array<{ label: string; onClick?: () => void }> = [
    { label: "Home", onClick: goHome },
  ];
  if (nav.department) {
    if (nav.level === "categories" || nav.level === "subcategories" || nav.level === "products") {
      breadcrumbs.push({
        label: nav.department.name,
        onClick:
          nav.level !== "categories"
            ? () => selectDepartment(nav.department!)
            : undefined,
      });
    }
  }
  if (nav.category && (nav.level === "subcategories" || nav.level === "products")) {
    breadcrumbs.push({
      label: nav.category.name,
      onClick:
        nav.level !== "subcategories"
          ? () => selectCategory(nav.category!)
          : undefined,
    });
  }
  if (nav.subcategory && nav.level === "products") {
    breadcrumbs.push({ label: nav.subcategory.name });
  }

  // ── Render ──

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Forklift</div>
        <div style={styles.selectionInfo}>
          {selection.hasProductPods
            ? `${selection.count} pod${selection.count > 1 ? "s" : ""} selected`
            : "Select a Product Pod"}
        </div>
      </div>

      <ModeToggle mode={mode} onToggle={setMode} />
      <StatusBar
        state={status.state}
        message={status.message}
        onDismiss={resetStatus}
      />

      {nav.level !== "departments" && <Breadcrumbs items={breadcrumbs} />}

      {/* Content area */}
      <div style={styles.content}>
        {catLoading && (
          <div style={styles.center}>Loading categories...</div>
        )}
        {catError && (
          <div style={{ ...styles.center, color: "#c00" }}>{catError}</div>
        )}

        {!catLoading && !catError && nav.level === "departments" && index && (
          <DepartmentList
            departments={index.categories}
            onSelect={selectDepartment}
          />
        )}

        {nav.level === "categories" &&
          nav.department?.subcategories && (
            <CategoryList
              categories={nav.department.subcategories}
              onSelect={selectCategory}
              onViewProducts={viewCategoryProducts}
            />
          )}

        {nav.level === "subcategories" &&
          nav.category?.subcategories && (
            <CategoryList
              categories={nav.category.subcategories}
              onSelect={selectSubcategory}
              onViewProducts={selectSubcategory}
            />
          )}

        {nav.level === "products" && (
          <ProductGrid
            products={products}
            loading={prodLoading}
            batchMode={mode === "batch"}
            hasProductPods={selection.hasProductPods}
            onUseSingle={handleUseSingle}
            onUseBatch={handleUseBatch}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#fff",
  },
  header: {
    padding: "12px",
    borderBottom: "1px solid #e5e5e5",
  },
  title: {
    fontSize: "15px",
    fontWeight: 700 as const,
    color: "#333",
  },
  selectionInfo: {
    fontSize: "11px",
    color: "#999",
    marginTop: "2px",
  },
  content: {
    flex: 1,
    overflowY: "auto" as const,
  },
  center: {
    padding: "24px",
    textAlign: "center" as const,
    color: "#999",
    fontSize: "12px",
  },
};
