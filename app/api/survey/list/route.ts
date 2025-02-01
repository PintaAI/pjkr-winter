import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const surveys = await db.survey.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error("[SURVEY_LIST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
