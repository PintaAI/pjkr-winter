"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Bus, Ticket, OptionalItem, StatusPeserta, UserRole } from "@prisma/client";
import { updateStatusPeserta, updatePeserta } from "@/app/actions/dashboard";
import { toast } from "sonner";
import { Check, X, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: peserta.name || "",
    email: peserta.email,
    telepon: peserta.telepon || "",
    alamat: peserta.alamat || "",
    ukuranBaju: peserta.ukuranBaju || "",
    ukuranSepatu: peserta.ukuranSepatu || "",
    tipeAlat: peserta.tipeAlat || "",
    role: peserta.role
  });

  const handleEditSubmit = async () => {
    const res = await updatePeserta(peserta.id, editForm);
    if (!res.success) {
      toast.error("Gagal memperbarui data peserta");
      return;
    }

    setPeserta(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
    toast.success("Data peserta berhasil diperbarui");
  };

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
          <div className="flex items-center gap-2">
            {peserta.name || ""}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Data Peserta</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telepon">Telepon</Label>
                    <Input
                      id="telepon"
                      value={editForm.telepon}
                      onChange={(e) => setEditForm(prev => ({ ...prev, telepon: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Input
                      id="alamat"
                      value={editForm.alamat}
                      onChange={(e) => setEditForm(prev => ({ ...prev, alamat: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ukuranBaju">Ukuran Baju</Label>
                    <Input
                      id="ukuranBaju"
                      value={editForm.ukuranBaju}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ukuranBaju: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ukuranSepatu">Ukuran Sepatu</Label>
                    <Input
                      id="ukuranSepatu"
                      value={editForm.ukuranSepatu}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ukuranSepatu: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipeAlat">Tipe Alat</Label>
                    <Select
                      value={editForm.tipeAlat}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, tipeAlat: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe alat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ski">Ski</SelectItem>
                        <SelectItem value="snowboard">Snowboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(value: UserRole) => setEditForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.PESERTA}>PESERTA</SelectItem>
                        <SelectItem value={UserRole.PANITIA}>PANITIA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleEditSubmit}>
                    Simpan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
          <p>Tipe Alat: {peserta.tipeAlat || "-"}</p>
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
