import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== "PANITIA") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get request body
    const { pesertaId, statusName } = await req.json();

    if (!pesertaId || !statusName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Find the status record
    const status = await db.statusPeserta.findFirst({
      where: {
        pesertaId,
        nama: statusName,
      },
      include: {
        peserta: {
          include: {
            bus: true,
            tiket: true,
            optionalItems: true,
            status: true,
          }
        }
      }
    });

    if (!status) {
      return new NextResponse("Status not found", { status: 404 });
    }

    // Update the status
    await db.statusPeserta.update({
      where: {
        id: status.id
      },
      data: {
        nilai: true,
        tanggal: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Status ${statusName} berhasil diperbarui`,
      peserta: status.peserta
    });

  } catch (error) {
    console.error("[STATUS_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
