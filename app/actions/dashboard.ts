"use server"

import { db } from "@/lib/db"
import { TicketType, BusType, RentalType } from "@prisma/client"

interface PackageUpdate {
  type: TicketType
  price: number
  description: string
}

interface BusUpdate {
  type: BusType
  name: string
  price: number
  capacity: number
}

interface RentalUpdate {
  type: RentalType
  name: string
  price: number
  description: string
  items: string[]
}

export async function updatePackage(data: PackageUpdate) {
  try {
    // TODO: Implement package update in database
    // Untuk saat ini kita hanya simulasikan update
    console.log("Updating package:", data)
    return { success: true, message: "Paket berhasil diperbarui" }
  } catch (error) {
    console.error("Error updating package:", error)
    return { success: false, message: "Gagal memperbarui paket" }
  }
}

export async function updateBus(data: BusUpdate) {
  try {
    const bus = await db.bus.upsert({
      where: {
        tipe: data.type
      },
      update: {
        namaBus: data.name,
        harga: data.price,
        kapasitas: data.capacity
      },
      create: {
        tipe: data.type,
        namaBus: data.name,
        harga: data.price,
        kapasitas: data.capacity
      }
    })

    return { success: true, message: "Bus berhasil diperbarui", data: bus }
  } catch (error) {
    console.error("Error updating bus:", error)
    return { success: false, message: "Gagal memperbarui bus" }
  }
}

export async function updateRental(data: RentalUpdate) {
  try {
    // Karena kita menyimpan items sebagai bagian dari namaBarang,
    // kita akan menggabungkannya menjadi satu string
    const itemsList = data.items.join(", ")
    
    await db.rental.updateMany({
      where: {
        tipe: data.type
      },
      data: {
        namaBarang: data.name,
        hargaSewa: data.price
      }
    })

    return { success: true, message: "Paket sewa berhasil diperbarui" }
  } catch (error) {
    console.error("Error updating rental:", error)
    return { success: false, message: "Gagal memperbarui paket sewa" }
  }
}

export async function getBusCapacityData() {
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
        type: bus.tipe,
        name: bus.namaBus,
        price: bus.harga,
        capacity: bus.kapasitas,
        currentOccupancy: bus._count.peserta
      }))
    }
  } catch (error) {
    console.error("Error fetching bus capacity:", error)
    return { success: false, message: "Gagal mengambil data kapasitas bus" }
  }
}

export async function getRentalData() {
  try {
    const rentals = await db.rental.groupBy({
      by: ['tipe', 'namaBarang', 'hargaSewa'],
    })

    return {
      success: true,
      data: rentals.map(rental => ({
        type: rental.tipe,
        name: rental.namaBarang,
        price: rental.hargaSewa
      }))
    }
  } catch (error) {
    console.error("Error fetching rental data:", error)
    return { success: false, message: "Gagal mengambil data sewa" }
  }
}
