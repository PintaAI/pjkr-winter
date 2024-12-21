"use server"

import { db } from "@/lib/db"

interface EventRegistrationData {
  name: string
  email: string
  phone: string
  address: string
  ticketType: string
  rentals: string[] // Ubah dari RentalType[] ke string[] untuk ID rental
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
    const { name, email, phone, address, ticketType, rentals, busId } = data

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

      if (selectedBus._count.peserta >= selectedBus.kapasitas) {
        return { success: false, message: 'Bus sudah penuh' }
      }
    }

    // Buat atau update user
    const user = await db.user.upsert({
      where: { email },
      update: {
        name,
        telepon: phone,
        alamat: address,
        busId: busId || null
      },
      create: {
        email,
        name,
        telepon: phone,
        alamat: address,
        role: "PESERTA",
        plan: "FREE",
        busId: busId || null
      },
    })

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

    // Buat tiket baru untuk user
    await db.ticket.create({
      data: {
        tipe: ticketType,
        harga: ticketConfig.harga,
        description: ticketConfig.description,
        features: ticketConfig.features,
        pesertaId: user.id,
      },
    })

    // Buat rental untuk setiap ID yang dipilih
    if (rentals.length > 0) {
      const rentalConfigs = await db.rental.findMany({
        where: {
          id: {
            in: rentals
          },
          peserta: {
            role: "PANITIA"
          }
        }
      })

      for (const rental of rentalConfigs) {
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

    // Buat status-status peserta
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



    // Create semua status
    for (const status of statusList) {
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

    return { success: true, message: 'Pendaftaran berhasil, silahkan lakukan pembayaran', userId: user.id }
  } catch (error) {
    console.error('Error in event registration:', error)
    return { success: false, message: 'Terjadi kesalahan saat mendaftar' }
  }
}
