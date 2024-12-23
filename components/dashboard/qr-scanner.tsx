"use client";

import { useState } from "react";
import { QrReader } from "react-qr-reader";
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

  const handleResult = async (result: any, error: any) => {
    if (error) {
      console.warn("Kesalahan pemindaian kode:", error);
      return;
    }

    if (!result?.text) return;

    // Validate QR code format
    if (!result.text.match(/^[a-zA-Z0-9_-]+$/)) {
      console.warn("Format QR code tidak valid");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/peserta/${result.text}`);
      
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
  };

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm mx-auto">
        <QrReader
          constraints={{
            facingMode: "environment"
          }}
          onResult={handleResult}
          className="w-full aspect-square"
          videoStyle={{ objectFit: "cover" }}
          scanDelay={500}
          ViewFinder={() => (
            <div className="border-2 border-primary w-48 h-48 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
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
