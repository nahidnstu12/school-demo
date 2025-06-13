import ProductList from "@/components/modules/product/List";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductList />
    </Suspense>
  );
}
