import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Survey ID is required" },
        { status: 400 }
      );
    }

    await db.survey.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Survey deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SURVEY_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete survey" },
      { status: 500 }
    );
  }
}
