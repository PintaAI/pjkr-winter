"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Bus, Ticket, OptionalItem, StatusPeserta, UserRole } from "@prisma/client";
import { updateStatusPeserta, updatePeserta, getBusData, getOptionalItemData } from "@/app/actions/dashboard";
import { toast } from "sonner";
import { Check, X, QrCode } from "lucide-react";
import { EditPesertaDialog } from "./dialogs/edit-peserta-dialog";
import { ManageOptionalItemsDialog } from "./dialogs/manage-optional-items-dialog";

type PesertaWithRelations = User & {
  bus: Bus | null;
  tiket: Ticket[];
  optionalItems: OptionalItem[];
  status: StatusPeserta[];
};

interface PesertaCardProps {
  peserta: PesertaWithRelations;
}

const formatPhoneNumber = (phone: string) => {
  if (!phone) return "";
  if (phone.startsWith("010")) {
    return "82" + phone.slice(1); // 010xxxx -> 8210xxxx
  }
  return "62" + phone.slice(1); // 08xxxx -> 628xxxx
};

export function PesertaCard({ peserta: initialPeserta }: PesertaCardProps) {
  const [peserta, setPeserta] = useState(initialPeserta);
  const [isEditing, setIsEditing] = useState(false);
  const [buses, setBuses] = useState<{ id: string; namaBus: string; kapasitas: number; terisi: number }[]>([]);
  const [isManagingItems, setIsManagingItems] = useState(false);
  const [optionalItems, setOptionalItems] = useState<{ id: string; namaItem: string; harga: number; deskripsi: string[] }[]>([]);
  const [editForm, setEditForm] = useState({
    name: peserta.name || "",
    email: peserta.email,
    telepon: peserta.telepon || "",
    alamat: peserta.alamat || "",
    ukuranBaju: peserta.ukuranBaju || "",
    ukuranSepatu: peserta.ukuranSepatu || "",
    tipeAlat: peserta.tipeAlat || "",
    role: peserta.role,
    busId: peserta.bus?.id || "none",
    ticketType: peserta.tiket[0]?.tipe || "",
    optionalItems: peserta.optionalItems.map(item => item.id)
  });

  const loadOptionalItems = useCallback(async () => {
    const res = await getOptionalItemData();
    if (res.success && res.data) {
      setOptionalItems(res.data);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [busRes, itemsRes] = await Promise.all([
        getBusData(),
        getOptionalItemData()
      ]);
      
      if (busRes.success && busRes.data) {
        setBuses(busRes.data);
      }
      
      if (itemsRes.success && itemsRes.data) {
        setOptionalItems(itemsRes.data);
      }
    };
    loadData();
  }, []);

  const handleEditSubmit = async () => {
    const formData = {
      ...editForm,
      busId: editForm.busId === "none" ? null : editForm.busId,
      optionalItems: editForm.optionalItems
    };
    const res = await updatePeserta(peserta.id, formData);
    if (!res.success) {
      toast.error("Gagal memperbarui data peserta");
      return;
    }

    // Map the selected IDs to the original optional items to preserve all fields
    const updatedOptionalItems = editForm.optionalItems.map(id => 
      peserta.optionalItems.find(item => item.id === id) || 
      optionalItems.find(item => item.id === id)!
    ).filter(Boolean);

    setPeserta(prev => ({
      ...prev,
      name: editForm.name,
      email: editForm.email,
      telepon: editForm.telepon,
      alamat: editForm.alamat,
      ukuranBaju: editForm.ukuranBaju,
      ukuranSepatu: editForm.ukuranSepatu,
      tipeAlat: editForm.tipeAlat,
      role: editForm.role,
      bus: editForm.busId === "none" ? null : buses.find(b => b.id === editForm.busId) || null,
      optionalItems: updatedOptionalItems as OptionalItem[]
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
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href={`/peserta/${peserta.id}/qr`} target="_blank">
                  <QrCode className="h-4 w-4" />
                </a>
              </Button>
              <EditPesertaDialog
                isOpen={isEditing}
                onOpenChange={setIsEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                buses={buses}
                optionalItems={optionalItems}
                selectedOptionalItems={peserta.optionalItems.map(item => item.id)}
                onSubmit={handleEditSubmit}
              />
            </div>
          </div>
          <Badge variant={peserta.role === UserRole.PANITIA ? "destructive" : "default"}>
            {peserta.role}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>Email: {peserta.email}</p>
          <p>Telepon: {peserta.telepon ? (
            <a 
              href={`https://wa.me/${formatPhoneNumber(peserta.telepon)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {peserta.telepon}
            </a>
          ) : "-"}</p>
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-base text-primary">Item Opsional</h4>
            <ManageOptionalItemsDialog
              isOpen={isManagingItems}
              onOpenChange={setIsManagingItems}
              pesertaId={peserta.id}
              optionalItems={optionalItems}
              selectedItems={peserta.optionalItems}
              onItemUpdate={(updatedItems) => {
                setPeserta(prev => ({
                  ...prev,
                  optionalItems: updatedItems
                }));
              }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {peserta.optionalItems.map((item) => (
              <Badge key={item.id} variant="outline">
                {item.namaItem}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
