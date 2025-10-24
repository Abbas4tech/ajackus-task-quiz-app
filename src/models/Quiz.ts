import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz extends Document {
  title: string;
  description?: string;
  questions: IQuestion[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 2 && v.length <= 6;
        },
        message: "Options must be between 2 and 6",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      validate: {
        validator: function (this: IQuestion, v: string) {
          return this.options.includes(v);
        },
        message: "Correct answer must be one of the options",
      },
    },
  },
  { _id: false }
);

const quizSchema = new Schema<Quiz>(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (v: IQuestion[]) {
          return v.length >= 1 && v.length <= 50;
        },
        message: "Quiz must have between 1 and 50 questions",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ title: 1 });
quizSchema.index({ createdAt: -1 });

const QuizModel: Model<Quiz> =
  mongoose.models.Quiz || mongoose.model<Quiz>("Quiz", quizSchema);

export default QuizModel;
