import { z } from "zod";

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
  correctAnswer: z.string().min(1, "Please select the correct answer"),
});

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required").max(100, "Title too long"),
  description: z.string().optional(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed"),
});

type Question = z.infer<typeof questionSchema>;
type QuizForm = z.infer<typeof quizSchema>;

export { questionSchema, quizSchema };
export type { Question, QuizForm };
