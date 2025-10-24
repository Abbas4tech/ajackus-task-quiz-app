import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/db/connection";
import QuizModel from "@/models/Quiz";
import { authOptions } from "../auth/options";
import { quizSchema } from "@/schemas/quiz";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const quizzes = await QuizModel.find()
      .select("title description createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await QuizModel.countDocuments();

    return NextResponse.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();

    const validationResult = quizSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const quizData = validationResult.data;

    const quiz = await QuizModel.create({
      ...quizData,
      createdBy: session.user._id,
    });

    return NextResponse.json(
      {
        message: "Quiz created successfully",
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          questionsCount: quiz.questions.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
