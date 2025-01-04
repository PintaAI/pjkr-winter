import { NextResponse } from "next/server";
import { updateAttendanceStatus } from "@/app/actions/attendance";

type AttendanceRequest = {
  pesertaId: string;
  type: 'departure' | 'return';
  busId: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!isValidAttendanceRequest(body)) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak valid" },
        { status: 400 }
      );
    }

    const { pesertaId, type, busId } = body;

    if (!pesertaId || !type || !busId) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const result = await updateAttendanceStatus(pesertaId, type, busId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses absensi" },
      { status: 500 }
    );
  }
}

function isValidAttendanceRequest(body: any): body is AttendanceRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof body.pesertaId === 'string' &&
    typeof body.busId === 'string' &&
    (body.type === 'departure' || body.type === 'return')
  );
}
