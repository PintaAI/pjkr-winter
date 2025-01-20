"use client";

import { Button } from "@/components/ui/button";
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
import { Edit } from "lucide-react";
import { UserRole } from "@prisma/client";
import { formatWon } from "@/lib/utils";

interface OptionalItem {
  id: string;
  namaItem: string;
  harga: number;
  deskripsi: string[];
}

interface Bus {
  id: string;
  namaBus: string;
  kapasitas: number;
  terisi: number;
}

interface EditFormData {
  optionalItems: string[]; // Array of optional item IDs
  name: string;
  email: string;
  telepon: string;
  alamat: string;
  ukuranBaju: string;
  ukuranSepatu: string;
  tipeAlat: string;
  role: UserRole;
  busId: string;
  ticketType: string;
}

interface EditPesertaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditFormData;
  setEditForm: (form: EditFormData) => void;
  buses: Bus[];
  optionalItems: OptionalItem[];
  selectedOptionalItems: string[];
  onSubmit: () => Promise<void>;
}

export function EditPesertaDialog({
  isOpen,
  onOpenChange,
  editForm,
  setEditForm,
  buses,
  optionalItems,
  selectedOptionalItems,
  onSubmit
}: EditPesertaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input
              id="telepon"
              value={editForm.telepon}
              onChange={(e) => setEditForm({ ...editForm, telepon: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              value={editForm.alamat}
              onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ukuranBaju">Ukuran Baju</Label>
            <Input
              id="ukuranBaju"
              value={editForm.ukuranBaju}
              onChange={(e) => setEditForm({ ...editForm, ukuranBaju: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ukuranSepatu">Ukuran Sepatu</Label>
            <Input
              id="ukuranSepatu"
              value={editForm.ukuranSepatu}
              onChange={(e) => setEditForm({ ...editForm, ukuranSepatu: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tipeAlat">Tipe Alat</Label>
            <Select
              value={editForm.tipeAlat}
              onValueChange={(value) => setEditForm({ ...editForm, tipeAlat: value })}
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
              onValueChange={(value: UserRole) => setEditForm({ ...editForm, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.PESERTA}>PESERTA</SelectItem>
                <SelectItem value={UserRole.PANITIA}>PANITIA</SelectItem>
                <SelectItem value={UserRole.CREW}>CREW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ticketType">Tipe Tiket</Label>
            <Select
              value={editForm.ticketType}
              onValueChange={(value) => setEditForm({ ...editForm, ticketType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe tiket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASIC PASS">Basic Pass</SelectItem>
                <SelectItem value="ESKALATOR PASS">Eskalator Pass</SelectItem>
                <SelectItem value="GONDOLA PASS">Gondola Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Optional Items</Label>
            <Select
              value="default"
              onValueChange={(value) => {
                if (value !== "default") {
                  const newItems = [...editForm.optionalItems];
                  if (!newItems.includes(value)) {
                    newItems.push(value);
                    setEditForm({ ...editForm, optionalItems: newItems });
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih item tambahan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" disabled>Pilih item tambahan</SelectItem>
                {optionalItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.namaItem} - {formatWon(item.harga)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-2 space-y-2">
              {editForm.optionalItems.map((itemId) => {
                const item = optionalItems.find((i) => i.id === itemId);
                if (!item) return null;
                
                return (
                  <div key={itemId} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                    <span className="text-sm">{item.namaItem} - {formatWon(item.harga)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditForm({
                          ...editForm,
                          optionalItems: editForm.optionalItems.filter(id => id !== itemId)
                        });
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bus">Bus</Label>
            <Select
              value={editForm.busId}
              onValueChange={(value) => setEditForm({ ...editForm, busId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih bus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada bus</SelectItem>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.namaBus} ({bus.terisi}/{bus.kapasitas})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit}>
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
