"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Bus, Ticket, Rental, StatusPeserta, UserRole } from "@prisma/client";
import { updateStatusPeserta } from "@/app/actions/dashboard";
import { toast } from "sonner";
import { Check, X } from "lucide-react"; // Import icon

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  sewaan: Rental[];
  status: StatusPeserta[];
};

interface PesertaCardProps {
  peserta: PesertaWithRelations;
}

export function PesertaCard({ peserta: initialPeserta }: PesertaCardProps) {
  const [peserta, setPeserta] = useState(initialPeserta);

  const handleStatusUpdate = async (item: StatusPeserta) => {
    const newValue = !item.nilai;
    const res = await updateStatusPeserta(peserta.id, item.nama, newValue, item.keterangan || undefined);
    if (!res.success) {
      toast.error("Gagal update status");
      return;
    }

    setPeserta((prev) => ({
      ...prev,
      status: prev.status.map((s) =>
        s.id === item.id ? { ...s, nilai: newValue, tanggal: new Date() } : s
      ),
    }));

    toast.success(`Status ${item.nama}: ${newValue ? "Sudah" : "Belum"}`);
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge
      variant={isActive ? "success" : "destructive"}
      className="flex items-center gap-1 px-2 py-1"
    >
      {isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    </Badge>
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {peserta.name}
          <Badge variant={peserta.role === UserRole.PANITIA ? "destructive" : "default"}>
            {peserta.role}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div>
          <p>Email: {peserta.email}</p>
          <p>Telepon: {peserta.telepon || "-"}</p>
          <p>Alamat: {peserta.alamat || "-"}</p>
        </div>

        {peserta.bus && (
          <div>
            <h4 className="font-semibold text-base text-primary">Bus</h4>
            <Badge variant="outline">{peserta.bus.namaBus}</Badge>
          </div>
        )}

        {peserta.tiket.length > 0 && (
          <div>
            <h4 className="font-semibold text-base text-primary">Tiket</h4>
            <div className="flex gap-2 flex-wrap">
              {peserta.tiket.map((t) => (
                <Badge key={t.id} variant="secondary">{t.tipe}</Badge>
              ))}
            </div>
          </div>
        )}

        {peserta.status.length > 0 && (
          <div>
            <h4 className="font-semibold text-base text-primary">Status</h4>
            <div className="flex flex-wrap gap-2">
              {peserta.status.map((s) => (
                <Button
                  key={s.id}
                  variant={s.nilai ? "default" : "outline"}
                  onClick={() => handleStatusUpdate(s)}
                  className="flex items-center justify-between w-full sm:w-auto px-3 py-2"
                >
                  <span className="mr-2">{s.nama}</span>
                  {getStatusBadge(s.nilai)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {peserta.sewaan.length > 0 && (
          <div>
            <h4 className="font-semibold text-base text-primary">Sewaan</h4>
            <div className="flex gap-2 flex-wrap">
              {peserta.sewaan.map((sw) => (
                <Badge key={sw.id} variant="outline">
                  {sw.namaBarang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
