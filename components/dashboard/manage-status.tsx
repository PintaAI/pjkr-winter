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
import { Plus, Pencil, Trash, Users, Ticket, Package, ShirtIcon, } from "lucide-react";
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
import { IconSkateboard, IconSkateboarding, IconBus, IconClock, IconProgress, IconArrowUpRight, IconPlaneArrival, IconPlaneDeparture, IconShoe } from "@tabler/icons-react";
import { calculateRegistrationStats, calculateStatusStats } from "@/lib/dashboard-stats";

interface StatusTemplate {
  nama: string;
  count: number;
}

import type { RegistrationStats, StatusStats } from "@/lib/dashboard-stats";

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
        
        // Calculate registration and status statistics using utility functions
        const regStats = calculateRegistrationStats(peserta);
        const stats = calculateStatusStats(peserta);

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
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Kelola Status Peserta</h2>
        <Dialog 
          open={open} 
          onOpenChange={setOpen}
        >
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              <span className="text-sm md:text-base">Tambah Status</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">
                {editingStatus ? "Edit Status" : "Tambah Status Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm md:text-base">Nama Status</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Contoh: Absen Keberangkatan"
                  required
                  className="text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan" className="text-sm md:text-base">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  placeholder="Keterangan tambahan (opsional)"
                  className="text-sm md:text-base"
                />
              </div>
              <Button type="submit" className="w-full text-sm md:text-base">
                {editingStatus ? "Perbarui" : "Tambah"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {registrationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Registration Overview */}
          <div className="p-4 md:p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              Statistik Pendaftaran
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    Total Peserta
                  </span>
                  <span className="text-base md:text-lg font-semibold">{registrationStats.totalPeserta}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    Total Crew
                  </span>
                  <span className="text-base md:text-lg font-semibold">{registrationStats.totalCrew}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-medium flex items-center gap-2">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    Total Keseluruhan
                  </span>
                  <span className="text-base md:text-lg font-semibold">{registrationStats.totalPeserta + registrationStats.totalCrew}</span>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-sm md:text-base font-semibold">Pemilihan Alat</h4>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <IconSkateboard className="w-3 h-3 md:w-4 md:h-4" />
                    Ski
                  </span>
                  <span className="font-medium">{registrationStats.equipmentCount.ski} peserta</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="flex items-center gap-2">
                    <IconSkateboarding className="w-3 h-3 md:w-4 md:h-4" />
                    Snowboard
                  </span>
                  <span className="font-medium">{registrationStats.equipmentCount.snowboard} peserta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Breakdown */}
          <div className="p-4 md:p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Ticket className="w-4 h-4 md:w-5 md:h-5" />
              Pemilihan Tiket
            </h3>
            <div className="space-y-4 md:space-y-6">
              {/* Peserta Tickets */}
              <div className="space-y-2">
                <h4 className="text-sm md:text-base font-semibold">Peserta</h4>
                <div className="space-y-3">
                  {Object.entries(registrationStats.ticketBreakdown.peserta).map(([type, count]) => (
                    <div key={`peserta-${type}`} className="flex justify-between text-sm md:text-base items-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-sm md:text-base truncate max-w-[200px]",
                          type.toLowerCase().includes('gondola') && "bg-purple-50 text-purple-700",
                          type.toLowerCase().includes('eskalator') && "bg-blue-50 text-blue-700",
                          type.toLowerCase().includes('basic') && "bg-green-50 text-green-700"
                        )}
                      >
                        {type}
                      </Badge>
                      <span className="font-medium">{count} peserta</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crew Tickets */}
              <div className="space-y-2">
                <h4 className="text-sm md:text-base font-semibold">Crew</h4>
                <div className="space-y-3">
                  {Object.entries(registrationStats.ticketBreakdown.crew).map(([type, count]) => (
                    <div key={`crew-${type}`} className="flex justify-between text-sm md:text-base items-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-sm md:text-base truncate max-w-[200px]",
                          type.toLowerCase().includes('gondola') && "bg-purple-50 text-purple-700",
                          type.toLowerCase().includes('eskalator') && "bg-blue-50 text-blue-700",
                          type.toLowerCase().includes('basic') && "bg-green-50 text-green-700"
                        )}
                      >
                        {type}
                      </Badge>
                      <span className="font-medium">{count} crew</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Tickets */}
              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-muted text-muted-foreground text-sm md:text-base">
                    Total Tiket
                  </Badge>
                  <span className="font-semibold">
                    {Object.values(registrationStats.ticketBreakdown.peserta).reduce((a, b) => a + b, 0) + 
                     Object.values(registrationStats.ticketBreakdown.crew).reduce((a, b) => a + b, 0)} tiket
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Items */}
          <div className="p-4 md:p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              Konsumsi
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Bus Ijeongbu */}
                <div className="space-y-3">
                  <h4 className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <IconBus className="w-3 h-3 md:w-4 md:h-4" />
                    Bus Ijeongbu
                  </h4>
                  <div className="p-2 rounded-lg border bg-card">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Peserta
                      </Badge>
                      <span className="font-medium">
                        {Object.entries(registrationStats.optionalItems.peserta)
                          .filter(([key]) => key.includes('(Bus Ijeongbu)'))
                          .reduce((acc, [_, count]) => acc + count, 0)} orang
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg border bg-card">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Crew
                      </Badge>
                      <span className="font-medium">
                        {Object.entries(registrationStats.optionalItems.crew)
                          .filter(([key]) => key.includes('(Bus Ijeongbu)'))
                          .reduce((acc, [_, count]) => acc + count, 0)} orang
                      </span>
                    </div>
                  </div>
                </div>

                {/* Other Buses */}
                <div className="space-y-3">
                  <h4 className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <IconBus className="w-3 h-3 md:w-4 md:h-4" />
                    Bus Lainnya
                  </h4>
                  <div className="p-2 rounded-lg border bg-card">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Peserta
                      </Badge>
                      <span className="font-medium">
                        {Object.entries(registrationStats.optionalItems.peserta)
                          .filter(([key]) => !key.includes('(Ijeongbu)'))
                          .reduce((acc, [_, count]) => acc + count, 0)} orang
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg border bg-card">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Crew
                      </Badge>
                      <span className="font-medium">
                        {Object.entries(registrationStats.optionalItems.crew)
                          .filter(([key]) => !key.includes('(Ijeongbu)'))
                          .reduce((acc, [_, count]) => acc + count, 0)} orang
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="p-2 rounded-lg border bg-muted">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-muted-foreground">
                      Total Keseluruhan
                    </Badge>
                    <span className="font-medium">
                      {Object.values(registrationStats.optionalItems.peserta).reduce((a, b) => a + b, 0) + 
                       Object.values(registrationStats.optionalItems.crew).reduce((a, b) => a + b, 0)} orang
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Size Statistics */}
          <div className="p-4 md:p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              Statistik Ukuran
            </h3>
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  
                  Ukuran Baju
                  <ShirtIcon className="w-3 h-3 md:w-4 md:h-4" />
                </h4>
                {Object.entries(registrationStats.sizeStats.baju)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([size, count]) => (
                    <div key={`baju-${size}`} className="border-b pb-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="ml-6">{size}</span>
                        <span className="font-medium">{count} peserta</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  Ukuran Sepatu
                  <IconShoe className="w-3 h-3 md:w-4 md:h-4" />
                </h4>
                {Object.entries(registrationStats.sizeStats.sepatu)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([size, count]) => (
                    <div key={`sepatu-${size}`} className="border-b pb-2">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="ml-6">{size}</span>
                        <span className="font-medium">{count} peserta</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Combined Status and Bus Progress */}
          {statusStats && (
            <div className="p-4 md:p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow col-span-full md:col-span-2">
              <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
                <IconProgress className="w-4 h-4 md:w-5 md:h-5" />
                Progress Status
              </h3>
              <div className="grid gap-6 md:gap-8">
                {Object.entries(statusStats.completionRates).map(([status, data]) => (
                  <div key={status} className="space-y-3 md:space-y-4">
                    <div className="flex justify-between text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        {status.toLowerCase().includes('keberangkatan') ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1 text-sm md:text-base truncate max-w-[200px]">
                            <IconPlaneDeparture className="w-3 h-3 md:w-4 md:h-4" />
                            {status}
                          </Badge>
                        ) : status.toLowerCase().includes('kepulangan') ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1 text-sm md:text-base truncate max-w-[200px]">
                            <IconPlaneArrival className="w-3 h-3 md:w-4 md:h-4" />
                            {status}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 text-sm md:text-base truncate max-w-[200px]">
                            {status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{Math.round(data.percentage)}% ({data.completed}/{registrationStats.totalPeserta + registrationStats.totalCrew})</span>
                        {data.percentage >= 100 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <span className="flex items-center gap-1 text-sm md:text-base">
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
                      <div className="flex gap-4 text-xs md:text-sm text-muted-foreground">
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
                        <h4 className="text-sm md:text-base font-semibold mb-3 flex items-center gap-2">
                          <IconBus className="w-3 h-3 md:w-4 md:h-4" />
                          Progress per Bus
                        </h4>
                        <div className="grid gap-2">
                          {Object.entries(statusStats.byBus).map(([bus, statuses]) => {
                            const count = statuses[status] || 0;
                            const isComplete = count === (registrationStats.totalPeserta + registrationStats.totalCrew);
                            return (
                              <div key={bus} className="flex justify-between items-center text-sm md:text-base">
                                <span className="font-medium">{bus}</span>
                                <div className="flex items-center gap-2">
                                  <span>{count} selesai</span>
                                  {isComplete && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      <span className="flex items-center gap-1 text-sm md:text-base">
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
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="text-sm md:text-base">Daftar template status yang tersedia</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm md:text-base">Nama Status</TableHead>
                <TableHead className="text-sm md:text-base">Jumlah Peserta</TableHead>
                <TableHead className="w-[100px] text-sm md:text-base">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusTemplates.map((status) => (
                <TableRow key={status.nama}>
                  <TableCell className="text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      {status.nama.toLowerCase().includes('keberangkatan') ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-sm md:text-base truncate max-w-[200px]">
                          {status.nama}
                        </Badge>
                      ) : status.nama.toLowerCase().includes('kepulangan') ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-sm md:text-base truncate max-w-[200px]">
                          {status.nama}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-sm md:text-base truncate max-w-[200px]">
                          {status.nama}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <span>{status.count} peserta</span>
                      {status.count === ((registrationStats?.totalPeserta || 0) + (registrationStats?.totalCrew || 0)) && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-sm md:text-base">
                          Lengkap
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1 md:space-x-2">
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
                        <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(status.nama)}
                      >
                        <Trash className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
