"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, UserPlan } from "@prisma/client"
import { auth } from "@/auth"

// Peserta Management Functions
export async function getPesertaData() {
  try {
    const peserta = await db.user.findMany({
      where: {
        role: UserRole.PESERTA
      },
      include: {
        tiket: true,
        optionalItems: true,
        bus: true,
        status: true,
        registration: {
          include: {
            peserta: true
          }
        }
      }
    })

    return { 
      success: true, 
      data: peserta.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        plan: p.plan,
        alamat: p.alamat,
        telepon: p.telepon,
        ukuranBaju: p.ukuranBaju,
        ukuranSepatu: p.ukuranSepatu,
        tiket: p.tiket,
        optionalItems: p.optionalItems,
        bus: p.bus,
        status: p.status,
        tipeAlat: p.tipeAlat,
        createdAt: p.createdAt,
        registration: p.registration // Include registration data instead of buktiPembayaran
      }))
    }
  } catch (error) {
    console.error("[GET_PESERTA_DATA_ERROR]", error)
    return { success: false, message: "Gagal mendapatkan data peserta" }
  }
}

export async function updatePeserta(id: string, data: {
  name?: string
  email?: string
  plan?: UserPlan
  alamat?: string
  telepon?: string
  busId?: string | null
  ukuranBaju?: string
  ukuranSepatu?: string
}) {
  try {
    await db.user.update({
      where: { id },
      data
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Data peserta berhasil diperbarui" }
  } catch (error) {
    console.error("[UPDATE_PESERTA_ERROR]", error)
    return { success: false, message: "Gagal memperbarui data peserta" }
  }
}

export async function deletePeserta(id: string) {
  try {
    // Check autentikasi dan role
    const session = await auth()
    if (!session) {
      return { success: false, message: "Anda harus login terlebih dahulu" }
    }
    
    if (session.user.role !== UserRole.PANITIA) {
      return { success: false, message: "Anda tidak memiliki akses untuk menghapus peserta" }
    }

    // Hapus semua relasi terlebih dahulu
    await db.$transaction([
      // Hapus status peserta
      db.statusPeserta.deleteMany({
        where: { pesertaId: id }
      }),
      // Hapus tiket peserta
      db.ticket.deleteMany({
        where: { pesertaId: id }
      }),
      // Hapus optional items peserta
      db.optionalItem.deleteMany({
        where: { pesertaId: id }
      }),
      // Hapus user/peserta
      db.user.delete({
        where: { id }
      })
    ])

    revalidatePath("/dashboard")
    return { success: true, message: "Peserta berhasil dihapus" }
  } catch (error) {
    console.error("[DELETE_PESERTA_ERROR]", error)
    return { success: false, message: "Gagal menghapus peserta" }
  }
}

// Optional Item Management Functions
export async function createOptionalItem(data: {
  namaItem: string
  harga: number
  deskripsi: string[]
}) {
  try {
    // Dapatkan user panitia
    const panitia = await db.user.findFirst({
      where: { role: UserRole.PANITIA }
    })

    if (!panitia) {
      return { success: false, message: "Tidak ada user panitia" }
    }

    await db.optionalItem.create({
      data: {
        namaItem: data.namaItem,
        harga: data.harga,
        deskripsi: data.deskripsi,
        pesertaId: panitia.id
      }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Item opsional berhasil ditambahkan" }
  } catch (error) {
    console.error("[CREATE_OPTIONAL_ITEM_ERROR]", error)
    return { success: false, message: "Gagal menambahkan item opsional" }
  }
}

export async function updateOptionalItem(id: string, data: {
  namaItem: string
  harga: number
  deskripsi: string[]
}) {
  try {
    // Pastikan item dimiliki oleh panitia
    const item = await db.optionalItem.findFirst({
      where: {
        id,
        peserta: {
          role: UserRole.PANITIA
        }
      }
    })

    if (!item) {
      return { success: false, message: "Item opsional tidak ditemukan" }
    }

    await db.optionalItem.update({
      where: { id },
      data: {
        namaItem: data.namaItem,
        harga: data.harga,
        deskripsi: data.deskripsi
      }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Item opsional berhasil diperbarui" }
  } catch (error) {
    console.error("[UPDATE_OPTIONAL_ITEM_ERROR]", error)
    return { success: false, message: "Gagal memperbarui item opsional" }
  }
}

export async function deleteOptionalItem(id: string) {
  try {
    // Pastikan item dimiliki oleh panitia
    const item = await db.optionalItem.findFirst({
      where: {
        id,
        peserta: {
          role: UserRole.PANITIA
        }
      }
    })

    if (!item) {
      return { success: false, message: "Item opsional tidak ditemukan" }
    }

    await db.optionalItem.delete({
      where: { id }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Item opsional berhasil dihapus" }
  } catch (error) {
    console.error("[DELETE_OPTIONAL_ITEM_ERROR]", error)
    return { success: false, message: "Gagal menghapus item opsional" }
  }
}

export async function getOptionalItemData() {
  try {
    const items = await db.optionalItem.findMany({
      where: {
        peserta: {
          role: UserRole.PANITIA
        }
      }
    })

    return { 
      success: true, 
      data: items.map(item => ({
        id: item.id,
        namaItem: item.namaItem,
        harga: item.harga,
        deskripsi: item.deskripsi
      }))
    }
  } catch (error) {
    console.error("[GET_OPTIONAL_ITEM_DATA_ERROR]", error)
    return { success: false, message: "Gagal mendapatkan data item opsional" }
  }
}

// Package Management Functions
export async function createPackage(data: { 
  tipe: string
  harga: number
  description: string
  features: string[]
}) {
  try {
    // Dapatkan user panitia
    const panitia = await db.user.findFirst({
      where: { role: UserRole.PANITIA }
    })

    if (!panitia) {
      return { success: false, message: "Tidak ada user panitia" }
    }

    await db.ticket.create({
      data: {
        tipe: data.tipe,
        harga: data.harga,
        description: data.description,
        features: data.features,
        pesertaId: panitia.id
      }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Paket berhasil ditambahkan" }
  } catch (error) {
    console.error("[CREATE_PACKAGE_ERROR]", error)
    return { success: false, message: "Gagal menambahkan paket" }
  }
}

export async function updatePackage(id: string, data: {
  harga: number
  description: string
  features: string[]
}) {
  try {
    // Pastikan paket dimiliki oleh panitia
    const ticket = await db.ticket.findFirst({
      where: {
        id,
        peserta: {
          role: UserRole.PANITIA
        }
      }
    })

    if (!ticket) {
      return { success: false, message: "Paket tidak ditemukan" }
    }

    await db.ticket.update({
      where: { id },
      data: {
        harga: data.harga,
        description: data.description,
        features: data.features
      }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Paket berhasil diperbarui" }
  } catch (error) {
    console.error("[UPDATE_PACKAGE_ERROR]", error)
    return { success: false, message: "Gagal memperbarui paket" }
  }
}

export async function deletePackage(id: string) {
  try {
    // Pastikan paket dimiliki oleh panitia
    const ticket = await db.ticket.findFirst({
      where: {
        id,
        peserta: {
          role: UserRole.PANITIA
        }
      }
    })

    if (!ticket) {
      return { success: false, message: "Paket tidak ditemukan" }
    }

    await db.ticket.delete({
      where: { id }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Paket berhasil dihapus" }
  } catch (error) {
    console.error("[DELETE_PACKAGE_ERROR]", error)
    return { success: false, message: "Gagal menghapus paket" }
  }
}

export async function getPackageData() {
  try {
    const packages = await db.ticket.findMany({
      where: {
        peserta: {
          role: UserRole.PANITIA
        }
      }
    })

    return { 
      success: true, 
      data: packages.map(pkg => ({
        id: pkg.id,
        tipe: pkg.tipe,
        harga: pkg.harga,
        description: pkg.description,
        features: pkg.features
      }))
    }
  } catch (error) {
    console.error("[GET_PACKAGE_DATA_ERROR]", error)
    return { success: false, message: "Gagal mendapatkan data paket" }
  }
}

// Bus Management Functions
export async function createBus(data: { namaBus: string; kapasitas: number }) {
  try {
    await db.bus.create({
      data: {
        namaBus: data.namaBus,
        kapasitas: data.kapasitas
      }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Bus berhasil ditambahkan" }
  } catch (error) {
    console.error("[CREATE_BUS_ERROR]", error)
    return { success: false, message: "Gagal menambahkan bus" }
  }
}

export async function updateBus(id: string, data: { namaBus: string; kapasitas: number }) {
  try {
    await db.bus.update({
      where: { id },
      data: {
        namaBus: data.namaBus,
        kapasitas: data.kapasitas
      }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Bus berhasil diperbarui" }
  } catch (error) {
    console.error("[UPDATE_BUS_ERROR]", error)
    return { success: false, message: "Gagal memperbarui bus" }
  }
}

export async function deleteBus(id: string) {
  try {
    await db.bus.delete({
      where: { id }
    })

    revalidatePath("/dashboard")
    return { success: true, message: "Bus berhasil dihapus" }
  } catch (error) {
    console.error("[DELETE_BUS_ERROR]", error)
    return { success: false, message: "Gagal menghapus bus" }
  }
}

export async function getBusData() {
  try {
    const buses = await db.bus.findMany({
      include: {
        _count: {
          select: { peserta: true }
        }
      }
    })

    return { 
      success: true, 
      data: buses.map(bus => ({
        id: bus.id,
        namaBus: bus.namaBus,
        kapasitas: bus.kapasitas,
        terisi: bus._count.peserta
      }))
    }
  } catch (error) {
    console.error("[GET_BUS_DATA_ERROR]", error)
    return { success: false, message: "Gagal mendapatkan data bus" }
  }
}

// Tambahkan fungsi getBusDetail
export async function getBusDetail(id: string) {
  try {
    const bus = await db.bus.findUnique({
      where: { id },
      include: {
        peserta: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            alamat: true,
            telepon: true,
            tipeAlat: true,
            optionalItems: true,
            status: {
              select: {
                id: true,
                nama: true,
                nilai: true,
                tanggal: true,
                keterangan: true
              }
            }
          },
        },
      },
    })

    if (!bus) {
      return { success: false, message: "Bus tidak ditemukan" }
    }

    return { 
      success: true, 
      data: {
        id: bus.id,
        namaBus: bus.namaBus,
        kapasitas: bus.kapasitas,
        peserta: bus.peserta
      }
    }
  } catch (error) {
    console.error("[GET_BUS_DETAIL_ERROR]", error)
    return { success: false, message: "Gagal mendapatkan detail bus" }
  }
}

// Status Management Functions
export async function createStatusTemplate(nama: string, keterangan?: string) {
  try {
    const peserta = await db.user.findMany({
      where: {
        role: UserRole.PESERTA
      }
    });

    const createPromises = peserta.map(p => 
      db.statusPeserta.create({
        data: {
          nama,
          keterangan,
          peserta: {
            connect: {
              id: p.id
            }
          }
        }
      })
    );

    await Promise.all(createPromises);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[CREATE_STATUS_ERROR]", error);
    return { success: false, error: "Gagal membuat status" };
  }
}

export async function updateStatusTemplate(statusNama: string, newNama: string, newKeterangan?: string) {
  try {
    await db.statusPeserta.updateMany({
      where: { nama: statusNama },
      data: {
        nama: newNama,
        keterangan: newKeterangan,
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_STATUS_ERROR]", error);
    return { success: false, error: "Gagal mengupdate status" };
  }
}

export async function deleteStatusTemplate(statusNama: string) {
  try {
    await db.statusPeserta.deleteMany({
      where: { nama: statusNama }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_STATUS_ERROR]", error);
    return { success: false, error: "Gagal menghapus status" };
  }
}

export async function updateStatusPeserta(
  pesertaId: string,
  statusNama: string,
  nilai: boolean,
  keterangan?: string
) {
  try {
    await db.statusPeserta.updateMany({
      where: {
        pesertaId,
        nama: statusNama
      },
      data: {
        nilai,
        keterangan,
        tanggal: new Date(),
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_STATUS_PESERTA_ERROR]", error);
    return { success: false, error: "Gagal mengupdate status peserta" };
  }
}

export async function getAllStatusTemplates() {
  try {
    const statuses = await db.statusPeserta.groupBy({
      by: ['nama'],
      _count: {
        nama: true
      },
      orderBy: {
        nama: 'asc'
      }
    });

    return { 
      success: true, 
      data: statuses.map(status => ({
        nama: status.nama,
        count: status._count.nama
      }))
    };
  } catch (error) {
    console.error("[GET_PESERTA_STATUS_ERROR]", error);
    return { success: false, error: "Gagal mendapatkan status peserta" };
  }
}

// ... kode lainnya tetap sama ...
