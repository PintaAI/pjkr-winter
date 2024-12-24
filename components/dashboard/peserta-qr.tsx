"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";

interface PesertaQRProps {
  peserta: {
    id: string;
    name: string;
    email: string;
    ukuranSepatu: string;
    ukuranBaju: string;
    jenisTiket: string;
    namaBus: string;
  };
}

export function PesertaQR({ peserta }: PesertaQRProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
      setIsDownloading(true);
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "white",
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `tiket-${peserta.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading ticket:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="print:p-0 print:m-0">
      <div ref={ticketRef}>
        <Card className="w-full max-w-sm mx-auto print:border-0 print:shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center">{peserta.name}</CardTitle>
            <Badge variant="secondary" className="mx-auto">
              {peserta.jenisTiket}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={peserta.id}
                size={200}
                level="H"
                includeMargin
                className="print:w-[300px] print:h-[300px]"
              />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{peserta.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bus:</span>
                <span>{peserta.namaBus}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ukuran Sepatu:</span>
                <span>{peserta.ukuranSepatu}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ukuran Baju:</span>
                <span>{peserta.ukuranBaju}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading}
        >
          {isDownloading ? "Mengunduh..." : "Unduh Tiket"}
        </Button>
      </div>
    </div>
  );
}
