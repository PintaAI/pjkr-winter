"use client";

import { useEffect, useState, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PesertaCard } from "./peserta-card";
import { User, Bus, Ticket, StatusPeserta, OptionalItem } from "@prisma/client";
import { Loader2 } from "lucide-react";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

export function QRScanner() {
  const [peserta, setPeserta] = useState<PesertaWithRelations | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

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
      return; // Don't make API call for invalid format
    }

    try {
      setLastScanTime(now);
      setIsLoading(true);
      setIsScanning(false);

      const response = await fetch(`/api/peserta/${pesertaId}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data peserta");
      }

      const data = await response.json();
      setPeserta(data);
      toast.success("Data peserta berhasil ditemukan");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memproses QR code");
      handleReset();
    } finally {
      setIsLoading(false);
    }
  }, [lastScanTime]);

  useEffect(() => {
    if (isScanning) {
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
        scanner.clear();
      }

      function onScanError(error: unknown) {
        // Only log the error, don't show toast for every failed scan attempt
        console.warn("Kesalahan pemindaian kode:", error);
      }

      return () => {
        scanner.clear().catch((error) => {
          console.error("Kesalahan saat membersihkan scanner:", error);
        });
      };
    }
  }, [isScanning, handleScan]);

  const handleReset = () => {
    setPeserta(null);
    setIsScanning(true);
  };

  return (
    <div className="space-y-4">
      {isScanning ? (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code Peserta</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="reader" className="w-full max-w-sm mx-auto"></div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat data peserta...</span>
          </CardContent>
        </Card>
      )}

      {peserta && !isLoading && (
        <div className="space-y-4">
          <PesertaCard peserta={peserta} />
          
          <div className="flex justify-end">
            <Button onClick={handleReset}>
              Scan Peserta Lain
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
