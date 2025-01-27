"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { toast } from "sonner";
import { PesertaCard } from "./peserta-card";
import { User, Bus, Ticket, StatusPeserta, OptionalItem } from "@prisma/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

interface QRScannerProps {
  type?: "departure" | "return";
  busId?: string;
  statusName?: string;
  onScanComplete?: (result: {
    peserta: PesertaWithRelations;
    success: boolean;
    message: string;
    code?: string; // misal server balikin kode error/sukses tertentu
  }) => void;
}

export function QRScanner({
  type,
  busId,
  statusName,
  onScanComplete,
}: QRScannerProps) {
  const router = useRouter();
  const [peserta, setPeserta] = useState<PesertaWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastScannedRef = useRef<{ code: string; timestamp: number } | null>(
    null
  );

  const handleScannerControl = (isDrawerOpen: boolean) => {
    if (!qrScannerRef.current) return;
    if (isDrawerOpen) {
      qrScannerRef.current.pause();
    } else {
      qrScannerRef.current.start();
    }
  };

  const processQRCode = async (qrText: string) => {
    // Debounce scan biar gak nge-scan berulang2 dalam 5 detik
    const now = Date.now();
    if (
      lastScannedRef.current?.code === qrText &&
      now - lastScannedRef.current.timestamp < 5000
    ) {
      return;
    }
    lastScannedRef.current = { code: qrText, timestamp: now };

    // Cek format QR code
    if (!qrText.match(/^[a-zA-Z0-9_-]+$/)) {
      console.warn("Format QR code tidak valid");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/peserta/${qrText}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data peserta");
      }

      const pesertaData = await response.json();

      // Kalau ada param (statusName, type, busId) -> Update data,
      // kalau nggak -> preview aja
      if (statusName || (type && busId)) {
        let updateResponse: Response | null = null;

        if (statusName) {
          // Update status
          updateResponse = await fetch("/api/status/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pesertaId: pesertaData.id,
              statusName,
            }),
          });
        } else if (type && busId) {
          // Update attendance
          updateResponse = await fetch("/api/attendance/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pesertaId: pesertaData.id,
              type,
              busId,
            }),
          });
        }

        if (!updateResponse || !updateResponse.ok) {
          throw new Error("Gagal memperbarui data peserta");
        }

        const result = await updateResponse.json();
        onScanComplete?.({
          peserta: pesertaData,
          success: result.success,
          message: result.message,
          code: result.code, // misal: "ALREADY_TRUE" dsb
        });

        if (result.success) {
          // Open the drawer and show success message
          setPeserta(pesertaData);
          setDrawerOpen(true);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } else {
        // Mode preview (tanpa update)
        setPeserta(pesertaData);
        setDrawerOpen(true);
        onScanComplete?.({
          peserta: pesertaData,
          success: true,
          message: "QR Code berhasil dipindai",
        });
        toast.success("Data peserta berhasil ditemukan");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memproses QR code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const videoElem = videoRef.current;
    if (!videoElem) return;

    const startScanner = async () => {
      try {
        // worker path
        QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

        qrScannerRef.current = new QrScanner(
          videoElem,
          async (result: QrScanner.ScanResult) => {
            await processQRCode(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            returnDetailedScanResult: true,
          }
        );

        await qrScannerRef.current.start();
      } catch (error) {
        console.error("Error starting QR scanner:", error);
        toast.error(
          "Gagal mengakses kamera. Pastikan kamera diizinkan dan tidak sedang digunakan aplikasi lain."
        );
      }
    };

    startScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [onScanComplete]);

  // Kontrol scanner kalau drawer dibuka/tutup pada mode preview
  useEffect(() => {
    if (!type && !busId && !statusName) {
      handleScannerControl(drawerOpen);
    }
  }, [drawerOpen, type, busId, statusName]);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm mx-auto relative">
        <video ref={videoRef} className="w-full aspect-square object-cover" />
        {needsRefresh && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {
                router.refresh();
                window.location.reload();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Scan Lagi
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Memuat data peserta...</span>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setPeserta(null);
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Data Peserta</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {peserta && <PesertaCard peserta={peserta} />}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
