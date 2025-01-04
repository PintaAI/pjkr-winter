import { Suspense } from "react";
import { ScannerContent } from "@/components/scan/scanner-content";

export default function ScanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
