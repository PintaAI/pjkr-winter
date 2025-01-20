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
import { Plus, Pencil, Trash, Users, Ticket, Package, } from "lucide-react";
import { toast } from "sonner";
import { 
  createStatusTemplate, 
  updateStatusTemplate, 
  deleteStatusTemplate,
  getAllStatusTemplates,
  getPesertaData 
} from "@/app/actions/dashboard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IconSkateboard, IconSkateboarding, IconBus, IconClock, IconProgress, IconArrowUpRight, IconPlaneArrival, IconPlaneDeparture } from "@tabler/icons-react";

interface StatusTemplate {
  nama: string;
  count: number;
}

interface RegistrationStats {
  totalPeserta: number;
  ticketBreakdown: {
    [key: string]: number;
  };
  equipmentCount: {
    ski: number;
    snowboard: number;
  };
  optionalItemsCount: {
    [key: string]: number;
  };
  sizeStats: {
    baju: { [size: string]: number };
    sepatu: { [size: string]: number };
  };
}

interface StatusStats {
  completionRates: {
    [key: string]: {
      completed: number;
      percentage: number;
    };
  };
  byBus: {
    [key: string]: {
      [status: string]: number;
    };
  };
  recentCompletions: {
    [key: string]: {
      last24h: number;
      last7d: number;
    };
  };
}

interface Status {
  nama: string;
  nilai: boolean;
  tanggal?: Date;
}

export function ManageStatus() {
  const [open, setOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusTemplate | null>(null);
  const [statusTemplates, setStatusTemplates] = useState<StatusTemplate[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats | null>(null);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    keterangan: "",
  });

  useEffect(() => {
    loadData();
  }, []); // Keep this for initial load

  // Add a refresh interval
  useEffect(() => {
    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load status templates
      const statusResult = await getAllStatusTemplates();
      if (statusResult.success && statusResult.data) {
        setStatusTemplates(statusResult.data);
      }

      // Load peserta data for statistics
      const pesertaResult = await getPesertaData();
      if (pesertaResult.success && pesertaResult.data) {
        const peserta = pesertaResult.data;
        const totalPeserta = peserta.length;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Initialize registration stats
        const regStats: RegistrationStats = {
          totalPeserta,
          ticketBreakdown: {},
          equipmentCount: {
            ski: 0,
            snowboard: 0
          },
          optionalItemsCount: {},
          sizeStats: {
            baju: {},
            sepatu: {}
          }
        };

        // Initialize status stats
        const stats: StatusStats = {
          completionRates: {},
          byBus: {},
          recentCompletions: {}
        };

        // Calculate statistics
        peserta.forEach(p => {
          // Equipment count
          if (p.tipeAlat === 'ski') regStats.equipmentCount.ski++;
          if (p.tipeAlat === 'snowboard') regStats.equipmentCount.snowboard++;

          // Ticket breakdown
          if (p.registration?.ticketType) {
            regStats.ticketBreakdown[p.registration.ticketType] = 
              (regStats.ticketBreakdown[p.registration.ticketType] || 0) + 1;
          }

          // Optional items count
          p.optionalItems.forEach(item => {
            regStats.optionalItemsCount[item.namaItem] = 
              (regStats.optionalItemsCount[item.namaItem] || 0) + 1;
          });

          // Count clothing and shoe sizes
          if (p.ukuranBaju) {
            regStats.sizeStats.baju[p.ukuranBaju] = 
              (regStats.sizeStats.baju[p.ukuranBaju] || 0) + 1;
          }
          if (p.ukuranSepatu) {
            regStats.sizeStats.sepatu[p.ukuranSepatu] = 
              (regStats.sizeStats.sepatu[p.ukuranSepatu] || 0) + 1;
          }

          // Status statistics
          (p.status as Status[]).forEach(s => {
            // Completion rates
            if (!stats.completionRates[s.nama]) {
              stats.completionRates[s.nama] = { completed: 0, percentage: 0 };
            }
            if (s.nilai) {
              stats.completionRates[s.nama].completed++;
            }

            // Bus breakdown
            if (p.bus?.namaBus) {
              if (!stats.byBus[p.bus.namaBus]) {
                stats.byBus[p.bus.namaBus] = {};
              }
              if (!stats.byBus[p.bus.namaBus][s.nama]) {
                stats.byBus[p.bus.namaBus][s.nama] = 0;
              }
              if (s.nilai) {
                stats.byBus[p.bus.namaBus][s.nama]++;
              }
            }

            // Recent completions
            if (!stats.recentCompletions[s.nama]) {
              stats.recentCompletions[s.nama] = { last24h: 0, last7d: 0 };
            }
            if (s.nilai && s.tanggal) {
              const completionDate = new Date(s.tanggal);
              if (completionDate >= oneDayAgo) {
                stats.recentCompletions[s.nama].last24h++;
              }
              if (completionDate >= sevenDaysAgo) {
                stats.recentCompletions[s.nama].last7d++;
              }
            }
          });
        });

        // Calculate percentages
        Object.keys(stats.completionRates).forEach(status => {
          stats.completionRates[status].percentage = 
            (stats.completionRates[status].completed / totalPeserta) * 100;
        });

        setStatusStats(stats);
        setRegistrationStats(regStats);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
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
        loadData();
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
        loadData();
      } else {
        toast.error(result.error || "Gagal menghapus status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kelola Status Peserta</h2>
        <Dialog 
          open={open} 
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button className="shadow-sm">
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

      {registrationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Registration Overview */}
          <div className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statistik Pendaftaran
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Pendaftar
                </span>
                <span className="text-lg font-semibold">{registrationStats.totalPeserta}</span>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Pemilihan Alat</h4>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <IconSkateboard className="w-4 h-4" />
                    Ski
                  </span>
                  <span className="font-medium">{registrationStats.equipmentCount.ski} peserta</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <IconSkateboarding className="w-4 h-4" />
                    Snowboard
                  </span>
                  <span className="font-medium">{registrationStats.equipmentCount.snowboard} peserta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Breakdown */}
          <div className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Pemilihan Tiket
            </h3>
            <div className="space-y-4">
              {Object.entries(registrationStats.ticketBreakdown).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="font-medium">{count} peserta</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Items */}
          <div className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Item Tambahan
            </h3>
            <div className="space-y-4">
              {Object.entries(registrationStats.optionalItemsCount).map(([item, count]) => (
                <div key={item} className="flex justify-between text-sm">
                  <span>{item}</span>
                  <span className="font-medium">{count} peserta</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size Statistics */}
          <div className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Statistik Ukuran
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Ukuran Baju</h4>
                {Object.entries(registrationStats.sizeStats.baju)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([size, count]) => (
                    <div key={`baju-${size}`} className="flex justify-between text-sm">
                      <span>Ukuran {size}</span>
                      <span className="font-medium">{count} peserta</span>
                    </div>
                  ))}
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Ukuran Sepatu</h4>
                {Object.entries(registrationStats.sizeStats.sepatu)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([size, count]) => (
                    <div key={`sepatu-${size}`} className="flex justify-between text-sm">
                      <span>Ukuran {size}</span>
                      <span className="font-medium">{count} peserta</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Combined Status and Bus Progress */}
          {statusStats && (
            <div className="p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow col-span-2">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <IconProgress className="w-5 h-5" />
                Progress Status
              </h3>
              <div className="grid gap-8">
                {Object.entries(statusStats.completionRates).map(([status, data]) => (
                  <div key={status} className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {status.toLowerCase().includes('keberangkatan') ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                            <IconPlaneDeparture className="w-3 h-3" />
                            {status}
                          </Badge>
                        ) : status.toLowerCase().includes('kepulangan') ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                            <IconPlaneArrival className="w-3 h-3" />
                            {status}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{Math.round(data.percentage)}% ({data.completed}/{registrationStats.totalPeserta})</span>
                        {data.percentage >= 100 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <span className="flex items-center gap-1">
                              <IconArrowUpRight className="w-3 h-3" />
                              Selesai
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                    {/* Recent activity */}
                    {statusStats.recentCompletions[status] && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          24j terakhir: +{statusStats.recentCompletions[status].last24h}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          7h terakhir: +{statusStats.recentCompletions[status].last7d}
                        </span>
                      </div>
                    )}
                    
                    {/* Bus Progress for this status */}
                    {Object.keys(statusStats.byBus).length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <IconBus className="w-4 h-4" />
                          Progress per Bus
                        </h4>
                        <div className="grid gap-2">
                          {Object.entries(statusStats.byBus).map(([bus, statuses]) => {
                            const count = statuses[status] || 0;
                            const isComplete = count === registrationStats.totalPeserta;
                            return (
                              <div key={bus} className="flex justify-between items-center text-sm">
                                <span className="font-medium">{bus}</span>
                                <div className="flex items-center gap-2">
                                  <span>{count} selesai</span>
                                  {isComplete && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      <span className="flex items-center gap-1">
                                        <IconArrowUpRight className="w-3 h-3" />
                                        Lengkap
                                      </span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border shadow-sm overflow-hidden">
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {status.nama.toLowerCase().includes('keberangkatan') ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {status.nama}
                      </Badge>
                    ) : status.nama.toLowerCase().includes('kepulangan') ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {status.nama}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {status.nama}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{status.count} peserta</span>
                    {status.count === (registrationStats?.totalPeserta || 0) && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Lengkap
                      </Badge>
                    )}
                  </div>
                </TableCell>
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
