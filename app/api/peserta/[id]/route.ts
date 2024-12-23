import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const peserta = await db.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        tiket: true,
        optionalItems: true,
        bus: true,
        status: true,
      },
    });

    if (!peserta) {
      return new NextResponse("Peserta tidak ditemukan", { status: 404 });
    }

    return NextResponse.json(peserta);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const {
      absenKeberangkatan,
      absenKepulangan,
      sudahTerimaBaju,
      sudahTerimaMakanan,
    } = body;

    const peserta = await db.user.update({
      where: {
        id: params.id,
      },
      data: {
        absenKeberangkatan,
        absenKepulangan,
        sudahTerimaBaju,
        sudahTerimaMakanan,
        ...(absenKeberangkatan && { tanggalKeberangkatan: new Date() }),
        ...(absenKepulangan && { tanggalKepulangan: new Date() }),
      },
      include: {
        tiket: true,
        optionalItems: true,
        bus: true,
        status: true,
      },
    });

    return NextResponse.json(peserta);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
