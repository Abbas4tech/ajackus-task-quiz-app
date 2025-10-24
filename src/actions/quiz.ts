"use server";

import { dbConnect } from "@/db/connection";
import QuizModel, { Quiz } from "@/models/Quiz";
import { notFound } from "next/navigation";

/**
 * Fetch all quizzes with optional pagination.
 */
export async function getAllQuizzes(limit = 50, skip = 0) {
  await dbConnect();
  const quizzes = await QuizModel.find({})
    .select("title description createdAt updatedAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  console.log(quizzes);

  const res = quizzes.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
  }));
  return res;
}

/**
 * Fetch a specific quiz by its MongoDB ID.
 */
export async function getQuizById(id: string) {
  await dbConnect();
  const quiz = await QuizModel.findById(id).lean();
  if (!quiz) notFound();
  return quiz;
}
