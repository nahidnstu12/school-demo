import SubjectList from "@/components/modules/subject/List";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubjectList />
    </Suspense>
  );
}
