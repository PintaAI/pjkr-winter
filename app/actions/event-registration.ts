"use server"

import { db } from "@/lib/db"
import { TicketType, RentalType, BusType } from "@prisma/client"

interface EventRegistrationData {
  name: string
  email: string
  phone: string
  address: string
  ticketType: TicketType
  rentals: {
    type: RentalType
    items: string[]
  }
  busType: BusType | ""
}

export type BusCapacity = {
  BUS_1: number;
  BUS_2: number;
  BUS_3: number;
  details: {
    [key in BusType]: {
      namaBus: string;
      harga: number;
      kapasitas: number;
    }
  }
}

type TicketPrices = {
  [K in TicketType]: number
}

type RentalInfo = {
  price: number
  name: string
}

type RentalPrices = {
  [K in RentalType]: RentalInfo
}

export async function getBusCapacity(): Promise<{ success: true, data: BusCapacity } | { success: false, error: string }> {
  try {
    const buses = await db.bus.findMany({
      include: {
        _count: {
          select: { peserta: true }
        }
      }
    })

    const capacity: BusCapacity = {
      BUS_1: buses.find(b => b.tipe === 'BUS_1')?._count.peserta || 0,
      BUS_2: buses.find(b => b.tipe === 'BUS_2')?._count.peserta || 0,
      BUS_3: buses.find(b => b.tipe === 'BUS_3')?._count.peserta || 0,
      details: {
        BUS_1: {
          namaBus: buses.find(b => b.tipe === 'BUS_1')?.namaBus || '',
          harga: buses.find(b => b.tipe === 'BUS_1')?.harga || 0,
          kapasitas: buses.find(b => b.tipe === 'BUS_1')?.kapasitas || 40
        },
        BUS_2: {
          namaBus: buses.find(b => b.tipe === 'BUS_2')?.namaBus || '',
          harga: buses.find(b => b.tipe === 'BUS_2')?.harga || 0,
          kapasitas: buses.find(b => b.tipe === 'BUS_2')?.kapasitas || 40
        },
        BUS_3: {
          namaBus: buses.find(b => b.tipe === 'BUS_3')?.namaBus || '',
          harga: buses.find(b => b.tipe === 'BUS_3')?.harga || 0,
          kapasitas: buses.find(b => b.tipe === 'BUS_3')?.kapasitas || 40
        }
      }
    }

    return { success: true, data: capacity }
  } catch (error) {
    console.error('Error getting bus capacity:', error)
    return { success: false, error: 'Gagal mengambil data kapasitas bus' }
  }
}

export async function getTicketPrices(): Promise<{ success: true, data: TicketPrices } | { success: false, error: string }> {
  try {
    // Di sini bisa ditambahkan query ke database jika harga tiket disimpan di database
    // Untuk sementara menggunakan harga hardcoded
    const prices: TicketPrices = {
      REGULAR: 100000,
      LIFT_GONDOLA: 150000
    }
    return { success: true, data: prices }
  } catch (error) {
    console.error('Error getting ticket prices:', error)
    return { success: false, error: 'Gagal mengambil data harga tiket' }
  }
}

export async function getRentalPrices(): Promise<{ success: true, data: RentalPrices } | { success: false, error: string }> {
  try {
    // Di sini bisa ditambahkan query ke database jika harga rental disimpan di database
    // Untuk sementara menggunakan harga hardcoded
    const prices: RentalPrices = {
      EQUIPMENT_FULLSET: {
        price: 100000,
        name: 'Peralatan Ski Fullset'
      },
      CLOTHING_FULLSET: {
        price: 50000,
        name: 'Pakaian Winter Fullset'
      }
    }
    return { success: true, data: prices }
  } catch (error) {
    console.error('Error getting rental prices:', error)
    return { success: false, error: 'Gagal mengambil data harga rental' }
  }
}

export async function registerEvent(data: EventRegistrationData) {
  try {
    const { name, email, phone, address, ticketType, rentals, busType } = data

    // Cek kapasitas bus jika dipilih
    if (busType) {
      const selectedBus = await db.bus.findUnique({
        where: { tipe: busType },
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
      },
      create: {
        email,
        name,
        telepon: phone,
        alamat: address,
      },
    })

    // Buat tiket
    const ticketPrices = await getTicketPrices()
    if (!ticketPrices.success) {
      return { success: false, message: ticketPrices.error }
    }
    
    await db.ticket.create({
      data: {
        tipe: ticketType,
        harga: ticketPrices.data[ticketType],
        pesertaId: user.id,
      },
    })

    // Buat rental jika ada
    if (rentals.items.includes('fullset')) {
      const rentalPrices = await getRentalPrices()
      if (!rentalPrices.success) {
        return { success: false, message: rentalPrices.error }
      }

      const rentalData = rentalPrices.data[rentals.type]
      await db.rental.create({
        data: {
          tipe: rentals.type,
          namaBarang: rentalData.name,
          hargaSewa: rentalData.price,
          pesertaId: user.id,
        },
      })
    }

    // Update bus assignment jika dipilih
    if (busType) {
      const selectedBus = await db.bus.findUnique({ where: { tipe: busType } })
      if (!selectedBus) {
        return { success: false, message: 'Bus tidak ditemukan' }
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          busId: selectedBus.id
        },
      })
    }

    return { success: true, message: 'Pendaftaran berhasil', userId: user.id }
  } catch (error) {
    console.error('Error in event registration:', error)
    return { success: false, message: 'Terjadi kesalahan saat mendaftar' }
  }
}
