import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bus, Ticket, Rental, StatusPeserta, UserRole } from "@prisma/client";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  sewaan: Rental[];
  status: StatusPeserta[];
};

interface PesertaCardProps {
  peserta: PesertaWithRelations;
}

export function PesertaCard({ peserta }: PesertaCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{peserta.name}</span>
          <Badge variant={peserta.role === UserRole.PANITIA ? "destructive" : "default"}>
            {peserta.role}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informasi Kontak */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Email: {peserta.email}</p>
          <p className="text-sm text-muted-foreground">Telepon: {peserta.telepon || "-"}</p>
          <p className="text-sm text-muted-foreground">Alamat: {peserta.alamat || "-"}</p>
        </div>

        {/* Informasi Bus */}
        <div className="space-y-2">
          <h4 className="font-semibold">Informasi Bus</h4>
          <Badge variant="outline">{peserta.bus?.namaBus || "Belum ditentukan"}</Badge>
        </div>

        {/* Informasi Tiket */}
        <div className="space-y-2">
          <h4 className="font-semibold">Paket Tiket</h4>
          <div className="flex gap-2 flex-wrap">
            {peserta.tiket.map((tiket) => (
              <Badge key={tiket.id} variant="secondary">
                {tiket.tipe}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <h4 className="font-semibold">Status</h4>
          <div className="grid grid-cols-2 gap-2">
            {peserta.status.map((status) => (
              <StatusBadge
                key={status.id}
                label={status.nama}
                status={status.nilai}
                keterangan={status.keterangan}
              />
            ))}
          </div>
        </div>

        {/* Sewaan */}
        {peserta.sewaan.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Sewaan</h4>
            <div className="flex gap-2 flex-wrap">
              {peserta.sewaan.map((sewa) => (
                <Badge key={sewa.id} variant="outline">
                  {sewa.namaBarang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  label: string;
  status: boolean;
  keterangan?: string | null;
}

function StatusBadge({ label, status, keterangan }: StatusBadgeProps) {
  return (
    <Badge 
      variant={status ? "success" : "destructive"}
      className="flex items-center justify-between"
      title={keterangan || undefined}
    >
      {label}: {status ? "✓" : "✗"}
    </Badge>
  );
}
