"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRScanner } from "@/components/dashboard/qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bus, Ticket, StatusPeserta, OptionalItem } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { updateAttendanceStatus } from "@/app/actions/attendance";
import { toast } from "sonner";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

type ScanHistory = {
  peserta: PesertaWithRelations;
  timestamp: Date;
  success: boolean;
  message: string;
};

export default function ScanPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'departure' | 'return';
  const busId = searchParams.get('busId');
  const [history, setHistory] = useState<ScanHistory[]>([]);

  const handleScanSuccess = async (data: PesertaWithRelations) => {
    try {
      if (!type || !busId) {
        // Just record the scan without attendance update
        setHistory(prev => [{
          peserta: data,
          timestamp: new Date(),
          success: true,
          message: 'Scan berhasil (mode preview)'
        }, ...prev]);
        toast.success('QR Code berhasil dipindai');
        return;
      }

      // If we have parameters, proceed with attendance update
      const result = await updateAttendanceStatus(data.id, type, busId);
      
      setHistory(prev => [{
        peserta: data,
        timestamp: new Date(),
        success: result.success,
        message: result.message
      }, ...prev]);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Gagal memproses absensi');
    }
  };

  const attendanceType = type ? (type === 'departure' ? 'Keberangkatan' : 'Kepulangan') : 'Preview';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scanner Section */}
      <div className="bg-background border-b">
        <div className="max-w-md mx-auto px-4 py-2">
          <h2 className="text-lg font-medium mb-2 text-center">
            {type ? `Absensi ${attendanceType}` : 'QR Scanner Preview'}
          </h2>
          <div className="relative rounded-lg overflow-hidden">
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
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          item.success ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.peserta.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.message}</span>
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
