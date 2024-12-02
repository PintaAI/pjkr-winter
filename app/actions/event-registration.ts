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
      BUS_1: buses.find(b => b.id === 'BUS_1')?._count.peserta || 0,
      BUS_2: buses.find(b => b.id === 'BUS_2')?._count.peserta || 0,
      BUS_3: buses.find(b => b.id === 'BUS_3')?._count.peserta || 0,
    }

    return { success: true, data: capacity }
  } catch (error) {
    console.error('Error getting bus capacity:', error)
    return { success: false, error: 'Gagal mengambil data kapasitas bus' }
  }
}

export async function registerEvent(data: EventRegistrationData) {
  try {
    const { name, email, phone, address, ticketType, rentals, busType } = data

    // Cek kapasitas bus jika dipilih
    if (busType) {
      const selectedBus = await db.bus.findFirst({
        where: { id: busType },
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
    const ticketPrice = ticketType === 'REGULAR' ? 100000 : 150000
    await db.ticket.create({
      data: {
        tipe: ticketType,
        harga: ticketPrice,
        pesertaId: user.id,
      },
    })

    // Buat rental jika ada
    if (rentals.items.includes('fullset')) {
      const rentalPrice = rentals.type === 'EQUIPMENT_FULLSET' ? 100000 : 50000
      const namaBarang = rentals.type === 'EQUIPMENT_FULLSET' 
        ? 'Peralatan Ski Fullset' 
        : 'Pakaian Winter Fullset'
      
      await db.rental.create({
        data: {
          tipe: rentals.type,
          namaBarang,
          hargaSewa: rentalPrice,
          pesertaId: user.id,
        },
      })
    }

    // Update bus assignment jika dipilih
    if (busType) {
      await db.user.update({
        where: { id: user.id },
        data: {
          bus: {
            connect: {
              id: busType,
            },
          },
        },
      })
    }

    return { success: true, message: 'Pendaftaran berhasil', userId: user.id }
  } catch (error) {
    console.error('Error in event registration:', error)
    return { success: false, message: 'Terjadi kesalahan saat mendaftar' }
  }
}
