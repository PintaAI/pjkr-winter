"use server"

import { db } from "@/lib/db"

interface PesertaData {
  name: string
  email: string
  phone: string
  address: string
  ukuranBaju: string
  ukuranSepatu: string
}

interface EventRegistrationData {
  peserta: PesertaData[]
  ticketType: string
  optionalItems: string[]
  busId: string | ""
}

// Mengambil data bus dari database
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
    console.error('Error getting bus data:', error)
    return { success: false, error: 'Gagal mengambil data bus' }
  }
}

// Mengambil data tiket dari database
export async function getTicketData() {
  try {
    const tickets = await db.ticket.findMany({
      where: {
        peserta: {
          role: "PANITIA"
        }
      }
    })
    return { 
      success: true, 
      data: tickets.map(ticket => ({
        tipe: ticket.tipe,
        harga: ticket.harga,
        description: ticket.description,
        features: ticket.features
      }))
    }
  } catch (error) {
    console.error('Error getting ticket data:', error)
    return { success: false, error: 'Gagal mengambil data tiket' }
  }
}

// Mengambil data item opsional dari database
export async function getOptionalItemData() {
  try {
    const items = await db.optionalItem.findMany({
      where: {
        peserta: {
          role: "PANITIA"
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
    console.error('Error getting optional item data:', error)
    return { success: false, error: 'Gagal mengambil data item opsional' }
  }
}

export async function registerEvent(data: EventRegistrationData) {
  try {
    const { peserta, ticketType, optionalItems, busId } = data

    // Cek kapasitas bus jika dipilih
    if (busId) {
      const selectedBus = await db.bus.findUnique({
        where: { id: busId },
        include: {
          _count: {
            select: { peserta: true }
          }
        }
      })

      if (!selectedBus) {
        return { success: false, message: 'Bus tidak ditemukan' }
      }

      // Cek apakah masih cukup untuk semua peserta
      if (selectedBus._count.peserta + peserta.length > selectedBus.kapasitas) {
        return { success: false, message: 'Kapasitas bus tidak cukup untuk semua peserta' }
      }
    }

    // Ambil konfigurasi tiket dari panitia
    const ticketConfig = await db.ticket.findFirst({
      where: {
        tipe: ticketType,
        peserta: {
          role: "PANITIA"
        }
      }
    })

    if (!ticketConfig) {
      return { success: false, message: 'Tipe tiket tidak valid' }
    }

    interface OptionalItemConfig {
      id: string
      namaItem: string
      harga: number
      deskripsi: string[]
    }

    // Ambil konfigurasi item opsional jika ada
    let optionalItemConfigs: OptionalItemConfig[] = []
    if (optionalItems.length > 0) {
      optionalItemConfigs = await db.optionalItem.findMany({
        where: {
          id: {
            in: optionalItems
          },
          peserta: {
            role: "PANITIA"
          }
        }
      })
    }

    const createdUsers = []

    // Proses setiap peserta
    for (const p of peserta) {
      // Cek apakah email atau nomor telepon sudah terdaftar
      let user = await db.user.findFirst({
        where: {
          OR: [
            { email: p.email },
            { telepon: p.phone }
          ]
        }
      })

      if (user && user.email === p.email && user.telepon !== p.phone) {
        return { success: false, message: 'Email sudah terdaftar dengan nomor telepon lain' }
      }

      if (user) {
        // Update user yang sudah ada
        user = await db.user.update({
          where: { id: user.id },
          data: {
            name: p.name,
            email: p.email,
            alamat: p.address,
            ukuranBaju: p.ukuranBaju,
            ukuranSepatu: p.ukuranSepatu,
            busId: busId || null
          }
        })
      } else {
        // Buat user baru
        user = await db.user.create({
          data: {
            name: p.name,
            email: p.email,
            telepon: p.phone,
            alamat: p.address,
            ukuranBaju: p.ukuranBaju,
            ukuranSepatu: p.ukuranSepatu,
            role: "PESERTA",
            plan: "FREE",
            busId: busId || null
          }
        })
      }

      // Cek apakah peserta sudah memiliki tiket dengan tipe yang sama
      const existingTicket = await db.ticket.findFirst({
        where: {
          pesertaId: user.id,
          tipe: ticketType
        }
      })

      // Buat tiket baru hanya jika belum ada
      if (!existingTicket) {
        await db.ticket.create({
          data: {
            tipe: ticketType,
            harga: ticketConfig.harga,
            description: ticketConfig.description,
            features: ticketConfig.features,
            pesertaId: user.id,
          },
        })
      }

      // Cek dan buat item opsional untuk peserta jika belum ada
      for (const item of optionalItemConfigs) {
        const existingItem = await db.optionalItem.findFirst({
          where: {
            pesertaId: user.id,
            namaItem: item.namaItem
          }
        })

        if (!existingItem) {
          await db.optionalItem.create({
            data: {
              namaItem: item.namaItem,
              harga: item.harga,
              deskripsi: item.deskripsi,
              pesertaId: user.id,
            },
          })
        }
      }

      // Cek status yang sudah ada
      const existingStatuses = await db.statusPeserta.findMany({
        where: { pesertaId: user.id }
      })

      // Definisi status yang diperlukan
      const statusList = [
        {
          nama: "Pembayaran",
          nilai: false,
          keterangan: "Menunggu konfirmasi pembayaran"
        },
        {
          nama: "Keberangkatan",
          nilai: false,
          keterangan: "Belum absen keberangkatan"
        },
        {
          nama: "Kepulangan",
          nilai: false,
          keterangan: "Belum absen kepulangan"
        }
      ]

      // Buat status yang belum ada
      for (const status of statusList) {
        const statusExists = existingStatuses.some(
          existing => existing.nama === status.nama
        )

        if (!statusExists) {
          await db.statusPeserta.create({
            data: {
              nama: status.nama,
              nilai: status.nilai,
              tanggal: new Date(),
              keterangan: status.keterangan,
              pesertaId: user.id
            }
          })
        }
      }

      createdUsers.push(user)
    }

    return { 
      success: true, 
      message: `Pendaftaran ${peserta.length} peserta berhasil, silahkan lakukan pembayaran`,
      userIds: createdUsers.map(u => u.id)
    }
  } catch (error) {
    console.error('Error in event registration:', error)
    return { success: false, message: 'Terjadi kesalahan saat mendaftar' }
  }
}
