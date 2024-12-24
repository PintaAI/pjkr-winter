"use client";

import { useState } from "react";
import { QRScanner } from "@/components/dashboard/qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bus, Ticket, StatusPeserta, OptionalItem } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

type ScanHistory = {
  peserta: PesertaWithRelations;
  timestamp: Date;
};

export default function ScanPage() {
  const [history, setHistory] = useState<ScanHistory[]>([]);

  const handleScanSuccess = (data: PesertaWithRelations) => {
    setHistory(prev => [{
      peserta: data,
      timestamp: new Date()
    }, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scanner Section */}
      <div className="bg-background border-b">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className=" relative rounded-lg overflow-hidden">
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="flex-1 bg-muted/10">
        <div className="max-w-md mx-auto px-4 py-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                Riwayat Scan
                <Badge variant="secondary" className="font-normal">
                  {history.length} scan
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-auto px-4">
                {history.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada riwayat scan
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {history.map((item, index) => (
                      <div
                        key={item.timestamp.getTime() + index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.peserta.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.peserta.email}</span>
                            {item.peserta.bus && (
                              <Badge variant="outline" className="font-normal">
                                Bus {item.peserta.bus.namaBus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-right text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(item.timestamp, {
                            addSuffix: true,
                            locale: id
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
