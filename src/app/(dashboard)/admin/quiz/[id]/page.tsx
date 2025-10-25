import { getAllQuizzes, getQuizById } from "@/actions/quiz";
import { QuizForm } from "@/components";
import React from "react";

const EditQuizDetails = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getQuizById(id);
  const quizData = {
    title: data.title,
    description: data.description,
    questions: data.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
    })),
  };
  return <QuizForm initialData={quizData} mode="edit" />;
};

export default EditQuizDetails;
