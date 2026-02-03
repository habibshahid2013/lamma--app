import { Suspense } from "react";
import SearchScreen from "@/components/main/SearchScreen";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SearchScreen />
    </Suspense>
  );
}
