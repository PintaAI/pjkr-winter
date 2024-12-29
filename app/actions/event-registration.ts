"use server"

import { db } from "@/lib/db"

interface PesertaData {
  name: string
  email: string
  phone: string
  address: string
  ukuranBaju: string
  ukuranSepatu: string
  tipeAlat: string
}

interface EventRegistrationData {
  peserta: PesertaData[]
  ticketType: string
  optionalItems: string[]
  busId: string | ""
  buktiPembayaran: string | null
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
    const { peserta, ticketType, optionalItems, busId, buktiPembayaran } = data
    
    console.log('Starting registration with data:', {
      pesertaCount: peserta.length,
      ticketType,
      optionalItems,
      busId,
      hasBuktiPembayaran: !!buktiPembayaran,
      pesertaDetails: peserta.map(p => ({
        name: p.name,
        tipeAlat: p.tipeAlat // Log tipeAlat for each peserta
      }))
    })

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

    // Hitung total amount
    const totalAmount = ticketConfig.harga * peserta.length

    // Buat registration group dengan nested create/connect untuk peserta dan update data yang sudah ada
    // Update existing users first
    await Promise.all(
      peserta.map(async p => {
        await db.user.upsert({
          where: { email: p.email },
          create: {
            name: p.name,
            email: p.email,
            telepon: p.phone,
            alamat: p.address,
            ukuranBaju: p.ukuranBaju,
            ukuranSepatu: p.ukuranSepatu,
            tipeAlat: p.tipeAlat,
            role: "PESERTA",
            plan: "FREE",
            busId: busId || null
          },
          update: {
            name: p.name,
            telepon: p.phone,
            alamat: p.address,
            ukuranBaju: p.ukuranBaju,
            ukuranSepatu: p.ukuranSepatu,
            tipeAlat: p.tipeAlat,
            busId: busId || null
          }
        })
      })
    )

    // Create registration and connect users
    const registration = await db.registration.create({
      data: {
        buktiPembayaran,
        totalAmount,
        ticketType,
        optionalItems,
        busId,
        status: "PENDING",
        peserta: {
          connect: peserta.map(p => ({ email: p.email }))
        }
      },
      include: {
        peserta: true
      }
    })
    
    console.log('Created registration record:', {
      registrationId: registration.id,
      status: registration.status,
      totalAmount,
      ticketType,
      optionalItems,
      busId
    })

    // Verify registration was created
    const verifyRegistration = await db.registration.findUnique({
      where: { id: registration.id },
      include: { peserta: true }
    })
    
    if (!verifyRegistration) {
      console.error('Failed to create registration record')
      return { success: false, message: 'Gagal membuat registrasi' }
    }
    
    console.log('Verified registration exists:', {
      registrationId: verifyRegistration.id,
      pesertaCount: verifyRegistration.peserta.length
    })

  

    // Proses setiap peserta dari hasil registration
    const createdUsers = []
    for (const p of peserta) {
      const registeredUser = registration.peserta.find(u => u.email === p.email)
      if (!registeredUser) {
        console.error('User not found in registration result:', p.email)
        continue
      }

      // Cek apakah peserta sudah memiliki tiket dengan tipe yang sama
      const existingTicket = await db.ticket.findFirst({
        where: {
          pesertaId: registeredUser.id,
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
            pesertaId: registeredUser.id,
          },
        })
      }

      // Cek dan buat item opsional untuk peserta
      if (optionalItems.length > 0) {
        const optionalItemConfigs = await db.optionalItem.findMany({
          where: {
            id: {
              in: optionalItems
            },
            peserta: {
              role: "PANITIA"
            }
          }
        })

        for (const item of optionalItemConfigs) {
          const existingItem = await db.optionalItem.findFirst({
            where: {
              pesertaId: registeredUser.id,
              namaItem: item.namaItem
            }
          })

          if (!existingItem) {
            await db.optionalItem.create({
              data: {
                namaItem: item.namaItem,
                harga: item.harga,
                deskripsi: item.deskripsi,
                pesertaId: registeredUser.id,
              },
            })
          }
        }
      }

      // Cek status yang sudah ada
      const existingStatuses = await db.statusPeserta.findMany({
        where: { pesertaId: registeredUser.id }
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
              pesertaId: registeredUser.id
            }
          })
        }
      }

      createdUsers.push(registeredUser)
    }

    // Get bus name if bus was selected
    const busName = busId ? (await db.bus.findUnique({ where: { id: busId } }))?.namaBus : '';

    // Get full peserta data for QR codes
    const pesertaData = createdUsers.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      ukuranSepatu: user.ukuranSepatu || '',
      ukuranBaju: user.ukuranBaju || '',
      tipeAlat: user.tipeAlat || '',
      jenisTiket: ticketType,
      namaBus: busName || 'Tidak memilih bus'
    }));

    // Final verification of registration and users
    const finalRegistration = await db.registration.findUnique({
      where: { id: registration.id },
      include: { peserta: true }
    })

    // Log final peserta details including tipeAlat
    console.log('Final peserta details:', finalRegistration?.peserta.map(p => ({
      name: p.name,
      tipeAlat: p.tipeAlat
    })))

    console.log('Final registration state:', {
      registrationId: finalRegistration?.id,
      expectedPesertaCount: peserta.length,
      actualPesertaCount: finalRegistration?.peserta.length,
      pesertaEmails: finalRegistration?.peserta.map(p => p.email)
    })

    if (!finalRegistration || finalRegistration.peserta.length !== peserta.length) {
      console.error('Registration verification failed:', {
        expected: peserta.length,
        actual: finalRegistration?.peserta.length
      })
      return { 
        success: false, 
        message: 'Terjadi kesalahan dalam verifikasi registrasi' 
      }
    }

    return { 
      success: true, 
      message: `Pendaftaran ${peserta.length} peserta berhasil`,
      data: pesertaData
    }
  } catch (error) {
    console.error('Error in event registration:', error)
    return { success: false, message: 'Terjadi kesalahan saat mendaftar' }
  }
}
