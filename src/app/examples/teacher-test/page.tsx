import TeacherList from "@/components/modules/teacher/List";
import { Suspense } from "react";


export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherList />
    </Suspense>
  );
}
