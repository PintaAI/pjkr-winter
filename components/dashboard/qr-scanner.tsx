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
  type?: 'departure' | 'return';
  busId?: string;
  statusName?: string;
  onScanComplete?: (result: {
    peserta: PesertaWithRelations;
    success: boolean;
    message: string;
  }) => void;
}

export function QRScanner({ type, busId, statusName, onScanComplete }: QRScannerProps) {
  const router = useRouter();
  const [peserta, setPeserta] = useState<PesertaWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastScannedRef = useRef<{ code: string; timestamp: number } | null>(null);

  // Fungsi untuk mengontrol scanner
  const handleScannerControl = (isDrawerOpen: boolean) => {
    if (!qrScannerRef.current) return;
    
    if (isDrawerOpen) {
      qrScannerRef.current.pause();
    } else {
      qrScannerRef.current.start();
    }
  };

  // Fungsi untuk memproses QR code dengan debounce
  const processQRCode = async (qrText: string) => {
    // Cek apakah code yang sama telah di-scan dalam 5 detik terakhir
    const now = Date.now();
    if (
      lastScannedRef.current?.code === qrText &&
      now - lastScannedRef.current.timestamp < 5000
    ) {
      return; // Abaikan scan yang terlalu cepat
    }

    // Update referensi scan terakhir
    lastScannedRef.current = {
      code: qrText,
      timestamp: now,
    };

    // Validate QR code format
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
      
      // Handle status update, attendance update, or preview mode
      try {
        let response;
        
        if (statusName) {
          // Update specific status
          response = await fetch('/api/status/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pesertaId: pesertaData.id,
              statusName
            }),
          });
        } else if (type && busId) {
          // Update attendance
          response = await fetch('/api/attendance/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pesertaId: pesertaData.id,
              type,
              busId
            }),
          });
        } else {
          // Preview mode - just show the drawer
          setPeserta(pesertaData);
          setDrawerOpen(true);
          onScanComplete?.({
            peserta: pesertaData,
            success: true,
            message: 'QR Code berhasil dipindai'
          });
          toast.success("Data peserta berhasil ditemukan");
          return;
        }

        if (!response || !response.ok) {
          throw new Error(statusName ? "Gagal memperbarui status" : "Gagal memperbarui status kehadiran");
        }

        const result = await response.json();

        if (result.statusAlreadyTrue) {
          toast.info("Status sudah benar");
          onScanComplete?.({
            peserta: pesertaData,
            success: true,
            message: 'Status sudah benar'
          });
          return;
        }
        
        onScanComplete?.({
          peserta: pesertaData,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          toast.success(result.message);
          // Ensure scanner remains active
          if (qrScannerRef.current) {
            qrScannerRef.current.start();
          }
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Error updating attendance:", error);
        onScanComplete?.({
          peserta: pesertaData,
          success: false,
          message: 'Gagal memproses absensi'
        });
        toast.error("Gagal memproses absensi");
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

    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Gagal mengakses kamera. Pastikan kamera diizinkan dan tidak sedang digunakan aplikasi lain.');
      }
    };

    const startScanner = async () => {
      try {
        // Create QR Scanner instance
        // Set worker path before creating scanner instance
        QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';
        
        qrScannerRef.current = new QrScanner(
          videoElem,
          async (result: QrScanner.ScanResult) => {
            await processQRCode(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            // Let browser choose best available camera
            returnDetailedScanResult: true
          }
        );

        await qrScannerRef.current.start();
      } catch (error) {
        console.error('Error starting QR scanner:', error);
        toast.error('Gagal mengakses kamera. Pastikan kamera diizinkan dan tidak sedang digunakan aplikasi lain.');
      }
    };

    requestCameraPermission();
    startScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [onScanComplete]);

  // Effect untuk mengontrol scanner berdasarkan status drawer
  useEffect(() => {
    // Only control scanner with drawer in preview mode
    if (!type && !busId) {
      handleScannerControl(drawerOpen);
    }
  }, [drawerOpen, type, busId]);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm mx-auto relative">
        <video
          ref={videoRef}
          className="w-full aspect-square object-cover"
        />
        {needsRefresh && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {
                // Refresh the entire page
                router.refresh();
                // Force a hard reload if needed
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
