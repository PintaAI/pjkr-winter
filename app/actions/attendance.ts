"use server"

import { db } from "@/lib/db"

export async function updateAttendanceStatus(
  pesertaId: string,
  type: 'departure' | 'return',
  busId: string
) {
  try {
    // Verify peserta is assigned to the bus
    const peserta = await db.user.findUnique({
      where: { 
        id: pesertaId,
        busId: busId
      }
    })

    if (!peserta) {
      return { 
        success: false, 
        message: 'Peserta tidak terdaftar di bus ini' 
      }
    }

    // Get the status name based on type
    const statusName = type === 'departure' ? 'Keberangkatan' : 'Kepulangan'

    // Update the status
    await db.statusPeserta.updateMany({
      where: {
        pesertaId: pesertaId,
        nama: statusName
      },
      data: {
        nilai: true,
        tanggal: new Date(),
        keterangan: `Absen ${statusName.toLowerCase()} berhasil`
      }
    })

    return {
      success: true,
      message: `Absen ${statusName.toLowerCase()} berhasil dicatat`
    }
  } catch (error) {
    console.error('Error updating attendance status:', error)
    return { 
      success: false, 
      message: 'Gagal mencatat kehadiran' 
    }
  }
}
