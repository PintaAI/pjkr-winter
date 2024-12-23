"use client";

import { useEffect, useState, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PesertaCard } from "./peserta-card";
import { User, Bus, Ticket, StatusPeserta, OptionalItem } from "@prisma/client";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

export function QRScanner() {
  const [peserta, setPeserta] = useState<PesertaWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounced scan handler
  const handleScan = useCallback(async (pesertaId: string) => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTime;
    
    // Prevent scanning more often than every 2 seconds
    if (timeSinceLastScan < 2000) {
      return;
    }
    
    // Validate QR code format first
    if (!pesertaId.match(/^[a-zA-Z0-9_-]+$/)) {
      console.warn("Format QR code tidak valid");
      return;
    }

    try {
      setLastScanTime(now);
      setIsLoading(true);

      const response = await fetch(`/api/peserta/${pesertaId}`);
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
  }, [lastScanTime]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText: string) {
      handleScan(decodedText);
    }

    function onScanError(error: unknown) {
      console.warn("Kesalahan pemindaian kode:", error);
    }

    return () => {
      scanner.clear().catch((error) => {
        console.error("Kesalahan saat membersihkan scanner:", error);
      });
    };
  }, [handleScan]);

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full max-w-sm mx-auto"></div>

      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Memuat data peserta...</span>
        </div>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
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
