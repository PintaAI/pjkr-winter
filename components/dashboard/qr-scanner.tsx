"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PesertaCard } from "./peserta-card";
import { User, Bus, Ticket, Rental, StatusPeserta } from "@prisma/client";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  sewaan: Rental[];
  status: StatusPeserta[];
};

export function QRScanner() {
  const [peserta, setPeserta] = useState<PesertaWithRelations | null>(null);
  const [isScanning, setIsScanning] = useState(true);

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

      function onScanError(error: any) {
        console.warn(`Code scan error = ${error}`);
      }

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [isScanning]);

  const handleScan = async (pesertaId: string) => {
    if (pesertaId) {
      try {
        setIsScanning(false);

        const response = await fetch(`/api/peserta/${pesertaId}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data peserta");
        }

        const data = await response.json();
        setPeserta(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Gagal memproses QR code");
      }
    }
  };

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

      {peserta && (
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
