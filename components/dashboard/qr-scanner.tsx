"use client";

import { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { toast } from "sonner";
import { PesertaCard } from "./peserta-card";
import { User, Bus, Ticket, StatusPeserta, OptionalItem } from "@prisma/client";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

// Configure QR Scanner worker path
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

export function QRScanner() {
  const [peserta, setPeserta] = useState<PesertaWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    const videoElem = videoRef.current;
    if (!videoElem) return;

    const startScanner = async () => {
      try {
        // Create QR Scanner instance
        qrScannerRef.current = new QrScanner(
          videoElem,
          async (result: QrScanner.ScanResult) => {
            const qrText = result.data;
            
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

              const data = await response.json();
              setPeserta(data);
              setDrawerOpen(true);
              toast.success("Data peserta berhasil ditemukan");
            } catch (error) {
              console.error("Error:", error);
              toast.error("Gagal memproses QR code");
            } finally {
              setIsLoading(false);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            preferredCamera: 'environment',
          }
        );

        await qrScannerRef.current.start();
      } catch (error) {
        console.error('Error starting QR scanner:', error);
        toast.error('Gagal mengakses kamera. Pastikan kamera diizinkan dan tidak sedang digunakan aplikasi lain.');
      }
    };

    startScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm mx-auto">
        <video 
          ref={videoRef}
          className="w-full aspect-square object-cover"
        />
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
