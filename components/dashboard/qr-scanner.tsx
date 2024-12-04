"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PesertaStatus {
  absenKeberangkatan: boolean;
  absenKepulangan: boolean;
  sudahTerimaPeralatan: boolean;
  sudahTerimaBaju: boolean;
  sudahTerimaMakanan: boolean;
}

export function QRScanner() {
  const [peserta, setPeserta] = useState<any>(null);
  const [status, setStatus] = useState<PesertaStatus>({
    absenKeberangkatan: false,
    absenKepulangan: false,
    sudahTerimaPeralatan: false,
    sudahTerimaBaju: false,
    sudahTerimaMakanan: false,
  });
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
        // Hentikan scanning setelah mendapatkan hasil
        setIsScanning(false);

        // Ambil data peserta
        const response = await fetch(`/api/peserta/${pesertaId}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data peserta");
        }

        const data = await response.json();
        setPeserta(data);
        
        // Set status awal dari data peserta
        setStatus({
          absenKeberangkatan: data.absenKeberangkatan || false,
          absenKepulangan: data.absenKepulangan || false,
          sudahTerimaPeralatan: data.sudahTerimaPeralatan || false,
          sudahTerimaBaju: data.sudahTerimaBaju || false,
          sudahTerimaMakanan: data.sudahTerimaMakanan || false,
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Gagal memproses QR code");
      }
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`/api/peserta/${peserta.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(status),
      });

      if (!response.ok) {
        throw new Error("Gagal mengupdate status");
      }

      toast.success("Status berhasil diupdate");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mengupdate status");
    }
  };

  const handleReset = () => {
    setPeserta(null);
    setStatus({
      absenKeberangkatan: false,
      absenKepulangan: false,
      sudahTerimaPeralatan: false,
      sudahTerimaBaju: false,
      sudahTerimaMakanan: false,
    });
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
        <Card>
          <CardHeader>
            <CardTitle>{peserta.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Email: {peserta.email}</p>
              <p className="text-sm text-muted-foreground">Telepon: {peserta.telepon || "-"}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Update Status</h3>
              
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="absenKeberangkatan"
                    checked={status.absenKeberangkatan}
                    onCheckedChange={(checked) =>
                      setStatus({ ...status, absenKeberangkatan: checked as boolean })
                    }
                  />
                  <Label htmlFor="absenKeberangkatan">Absen Keberangkatan</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="absenKepulangan"
                    checked={status.absenKepulangan}
                    onCheckedChange={(checked) =>
                      setStatus({ ...status, absenKepulangan: checked as boolean })
                    }
                  />
                  <Label htmlFor="absenKepulangan">Absen Kepulangan</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sudahTerimaPeralatan"
                    checked={status.sudahTerimaPeralatan}
                    onCheckedChange={(checked) =>
                      setStatus({ ...status, sudahTerimaPeralatan: checked as boolean })
                    }
                  />
                  <Label htmlFor="sudahTerimaPeralatan">Terima Peralatan</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sudahTerimaBaju"
                    checked={status.sudahTerimaBaju}
                    onCheckedChange={(checked) =>
                      setStatus({ ...status, sudahTerimaBaju: checked as boolean })
                    }
                  />
                  <Label htmlFor="sudahTerimaBaju">Terima Baju</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sudahTerimaMakanan"
                    checked={status.sudahTerimaMakanan}
                    onCheckedChange={(checked) =>
                      setStatus({ ...status, sudahTerimaMakanan: checked as boolean })
                    }
                  />
                  <Label htmlFor="sudahTerimaMakanan">Terima Makanan</Label>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleStatusUpdate}>Update Status</Button>
              <Button variant="outline" onClick={handleReset}>
                Scan Peserta Lain
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
