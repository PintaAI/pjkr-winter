"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PesertaQRProps {
  peserta: {
    id: string;
    name: string;
    email: string;
  };
}

export function PesertaQR({ peserta }: PesertaQRProps) {
  const [showQR, setShowQR] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:p-0 print:m-0">
      <Card className="w-full max-w-sm mx-auto print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-center">{peserta.name}</CardTitle>
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
          <p className="text-sm text-muted-foreground text-center">
            {peserta.email}
          </p>
          <div className="print:hidden">
            <Button onClick={handlePrint}>Cetak QR Code</Button>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          @page {
            size: 80mm 100mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          .print-qr,
          .print-qr * {
            visibility: visible;
          }
          .print-qr {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
