import { QRScanner } from "@/components/dashboard/qr-scanner";

export default function ScanPage() {
  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Scan QR Code Peserta</h1>
        <QRScanner />
      </div>
    </div>
  );
}
