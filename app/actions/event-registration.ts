"use server"

import { db } from "@/lib/db"

interface PesertaData {
  name: string
  phone: string
  address: string
  ukuranBaju: string
  ukuranSepatu: string
}

interface EventRegistrationData {
  peserta: PesertaData[]
  ticketType: string
  rentals: string[]
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

// Mengambil data rental dari database
export async function getRentalData() {
  try {
    const rentals = await db.rental.findMany({
      where: {
        peserta: {
          role: "PANITIA"
        }
      }
    })
    return { 
      success: true, 
      data: rentals.map(rental => ({
        id: rental.id,
        namaBarang: rental.namaBarang,
        hargaSewa: rental.hargaSewa,
        items: rental.items
      }))
    }
  } catch (error) {
    console.error('Error getting rental data:', error)
    return { success: false, error: 'Gagal mengambil data rental' }
  }
}

export async function registerEvent(data: EventRegistrationData) {
  try {
    const { peserta, ticketType, rentals, busId } = data

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

    interface RentalConfig {
      id: string
      namaBarang: string
      hargaSewa: number
      items: string[]
    }

    // Ambil konfigurasi rental jika ada
    let rentalConfigs: RentalConfig[] = []
    if (rentals.length > 0) {
      rentalConfigs = await db.rental.findMany({
        where: {
          id: {
            in: rentals
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
      // Cek apakah nomor telepon sudah terdaftar
      let user = await db.user.findFirst({
        where: { telepon: p.phone }
      })

      if (user) {
        // Update user yang sudah ada
        user = await db.user.update({
          where: { id: user.id },
          data: {
            name: p.name,
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
            // Prisma mengharuskan field email didefinisikan meskipun optional di schema
            // Menggunakan string kosong sebagai nilai default untuk memenuhi tipe UserCreateInput
            email: "",
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

      // Cek dan buat rental untuk peserta jika belum ada
      for (const rental of rentalConfigs) {
        const existingRental = await db.rental.findFirst({
          where: {
            pesertaId: user.id,
            namaBarang: rental.namaBarang
          }
        })

        if (!existingRental) {
          await db.rental.create({
            data: {
              namaBarang: rental.namaBarang,
              hargaSewa: rental.hargaSewa,
              items: rental.items,
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
