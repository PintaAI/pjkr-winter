import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { howDidYouKnow, eventRating, foodRating, serviceRating, merchandiseRating, feedback } = body;

    // Validate howDidYouKnow is provided
    if (!howDidYouKnow || typeof howDidYouKnow !== 'string') {
      return NextResponse.json({ error: "Missing or invalid howDidYouKnow field" }, { status: 400 });
    }

    // Convert ratings to numbers
    const parsedRatings = {
      eventRating: Number(eventRating),
      foodRating: Number(foodRating),
      serviceRating: Number(serviceRating),
      merchandiseRating: Number(merchandiseRating)
    };

    // Validate all ratings are valid numbers between 1-5
    for (const [field, rating] of Object.entries(parsedRatings)) {
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: `Invalid ${field}. Ratings must be between 1 and 5` }, { status: 400 });
      }
    }

    // Create survey data object
    const data: Prisma.SurveyUncheckedCreateInput = {
      howDidYouKnow,
      ...parsedRatings,
      feedback: feedback || undefined
    };

    // Create survey
    const survey = await db.survey.create({ data });
    
    return NextResponse.json({ message: "Survey submitted successfully", survey }, { status: 200 });
  } catch (error) {
    console.error("[SURVEY_SUBMIT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
