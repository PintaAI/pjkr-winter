"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { 
  createStatusTemplate, 
  updateStatusTemplate, 
  deleteStatusTemplate,
  getAllStatusTemplates 
} from "@/app/actions/dashboard";

interface StatusTemplate {
  nama: string;
  count: number;
}

export function ManageStatus() {
  const [open, setOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusTemplate | null>(null);
  const [statusTemplates, setStatusTemplates] = useState<StatusTemplate[]>([]);
  const [formData, setFormData] = useState({
    nama: "",
    keterangan: "",
  });

  useEffect(() => {
    loadStatusTemplates();
  }, []);

  const loadStatusTemplates = async () => {
    const result = await getAllStatusTemplates();
    if (result.success && result.data) {
      setStatusTemplates(result.data);
    } else {
      toast.error("Gagal memuat data status");
      setStatusTemplates([]); // Set empty array as fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      
      if (editingStatus) {
        result = await updateStatusTemplate(
          editingStatus.nama,
          formData.nama,
          formData.keterangan
        );
      } else {
        result = await createStatusTemplate(
          formData.nama,
          formData.keterangan
        );
      }

      if (result.success) {
        toast.success(editingStatus ? "Status berhasil diperbarui" : "Status baru berhasil ditambahkan");
        setOpen(false);
        setEditingStatus(null);
        setFormData({ nama: "", keterangan: "" });
        loadStatusTemplates();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = async (statusNama: string) => {
    try {
      const result = await deleteStatusTemplate(statusNama);
      
      if (result.success) {
        toast.success("Status berhasil dihapus");
        loadStatusTemplates();
      } else {
        toast.error(result.error || "Gagal menghapus status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Kelola Status Peserta</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStatus ? "Edit Status" : "Tambah Status Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Status</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Contoh: Absen Keberangkatan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  placeholder="Keterangan tambahan (opsional)"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingStatus ? "Perbarui" : "Tambah"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Daftar template status yang tersedia</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Status</TableHead>
              <TableHead>Jumlah Peserta</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statusTemplates.map((status) => (
              <TableRow key={status.nama}>
                <TableCell>{status.nama}</TableCell>
                <TableCell>{status.count} peserta</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingStatus(status);
                        setFormData({
                          nama: status.nama,
                          keterangan: "",
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(status.nama)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
