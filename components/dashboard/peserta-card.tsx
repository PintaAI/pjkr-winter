"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Bus, Ticket, OptionalItem, StatusPeserta, UserRole } from "@prisma/client";
import { updateStatusPeserta } from "@/app/actions/dashboard";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          {peserta.name}
          <Badge variant={peserta.role === UserRole.PANITIA ? "destructive" : "default"}>
            {peserta.role}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>Email: {peserta.email}</p>
          <p>Telepon: {peserta.telepon || "-"}</p>
          <p>Alamat: {peserta.alamat || "-"}</p>
          <p>Ukuran Baju: {peserta.ukuranBaju || "-"}</p>
          <p>Ukuran Sepatu: {peserta.ukuranSepatu || "-"}</p>
        </div>

        {peserta.bus && (
          <div>
            <h4 className="font-semibold text-base text-primary mb-2">Bus</h4>
            <Badge variant="outline">{peserta.bus.namaBus}</Badge>
          </div>
        )}

        {peserta.tiket.length > 0 && (
          <div>
            <h4 className="font-semibold text-base text-primary mb-2">Tiket</h4>
            <div className="flex gap-2 flex-wrap">
              {peserta.tiket.map((t) => (
                <Badge key={t.id} variant="secondary">{t.tipe}</Badge>
              ))}
            </div>
          </div>
        )}

        {peserta.status.length > 0 && (
          <div>
            <h4 className="font-semibold text-base text-primary mb-2">Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {peserta.status.map((s) => (
                <Button
                  key={s.id}
                  variant={s.nilai ? "default" : "outline"}
                  onClick={() => handleStatusUpdate(s)}
                  className="flex items-center justify-between px-3 py-2 h-auto"
                >
                  <span className="mr-2">{s.nama}</span>
                  {getStatusBadge(s.nilai)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {peserta.optionalItems.length > 0 && (
          <div>
            <h4 className="font-semibold text-base text-primary mb-2">Item Opsional</h4>
            <div className="flex gap-2 flex-wrap">
              {peserta.optionalItems.map((item) => (
                <Badge key={item.id} variant="outline">
                  {item.namaItem}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
