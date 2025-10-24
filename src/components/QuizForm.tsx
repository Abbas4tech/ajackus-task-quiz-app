"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CheckCircle2, Save, Loader2 } from "lucide-react";
import { QuizForm, quizSchema } from "@/schemas/quiz";

interface QuizFormComponentProps {
  mode: "create" | "edit";
  quizId?: string;
  initialData?: QuizForm;
}

export default function QuizFormComponent({
  mode,
  quizId,
  initialData,
}: QuizFormComponentProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: initialData || {
      title: "",
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const [optionInputs, setOptionInputs] = useState(["", ""]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  function handleAddOption() {
    setOptionInputs((prev) => [...prev, ""]);
  }

  function handleRemoveOption(idx: number) {
    if (optionInputs.length > 2) {
      setOptionInputs((opts) => opts.filter((_, i) => i !== idx));
      // Reset correct answer if it was the removed option
      if (correctAnswer === optionInputs[idx]) {
        setCorrectAnswer("");
      }
    }
  }

  function handleOptionChange(idx: number, value: string) {
    setOptionInputs((opts) => opts.map((v, i) => (i === idx ? value : v)));
  }

  function handleAddQuestion() {
    const validOptions = optionInputs.filter((opt) => opt.trim());

    if (
      newQuestionText.trim() &&
      validOptions.length >= 2 &&
      correctAnswer &&
      validOptions.includes(correctAnswer)
    ) {
      append({
        questionText: newQuestionText,
        options: validOptions,
        correctAnswer,
      });
      setNewQuestionText("");
      setOptionInputs(["", ""]);
      setCorrectAnswer("");
    } else {
      console.error("Please fill all the details");
    }
  }

  async function submitQuiz(data: QuizForm) {
    setIsSubmitting(true);
    try {
      const url = mode === "create" ? "/api/quiz" : `/api/quiz/${quizId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      const result = await response.json();

      router.push(`/admin/quiz/${result.quiz.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Create New Quiz" : "Edit Quiz"}
          </h1>
          <p className="text-slate-600 mt-2">
            {mode === "create"
              ? "Build your MCQ quiz with multiple questions and options"
              : "Update your quiz details and questions"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitQuiz)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quiz Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter quiz title..."
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Add Question Card */}
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-xl">Add New Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <FormLabel>Question Text</FormLabel>
                  <Input
                    placeholder="Enter your question..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="text-base mt-2"
                  />
                </div>

                <div>
                  <FormLabel>Answer Options</FormLabel>
                  <div className="space-y-2 mt-2">
                    {optionInputs.map((value, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={value}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          className="text-base"
                        />
                        {optionInputs.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleAddOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                {optionInputs.filter(Boolean).length > 1 && (
                  <div>
                    <FormLabel className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Select Correct Answer
                    </FormLabel>
                    <RadioGroup
                      value={correctAnswer}
                      onValueChange={setCorrectAnswer}
                      className="mt-3 space-y-2"
                    >
                      {optionInputs.map(
                        (opt, idx) =>
                          opt && (
                            <div
                              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                              key={idx}
                            >
                              <RadioGroupItem
                                value={opt}
                                id={`correct${idx}`}
                              />
                              <label
                                htmlFor={`correct${idx}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {opt}
                              </label>
                            </div>
                          )
                      )}
                    </RadioGroup>
                  </div>
                )}

                <Separator />

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleAddQuestion}
                  disabled={
                    !newQuestionText ||
                    !correctAnswer ||
                    optionInputs.filter(Boolean).length < 2
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question to Quiz
                </Button>
              </CardContent>
            </Card>

            {/* Questions Preview */}
            {fields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Questions Preview ({fields.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-semibold text-slate-900">
                          {idx + 1}. {q.questionText}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="space-y-2 ml-4">
                        {q.options.map((opt, oidx) => (
                          <div
                            key={oidx}
                            className={`flex items-center gap-2 text-sm ${
                              opt === q.correctAnswer
                                ? "text-green-700 font-medium"
                                : "text-slate-600"
                            }`}
                          >
                            <span className="w-6 h-6 flex items-center justify-center rounded-full border text-xs">
                              {String.fromCharCode(65 + oidx)}
                            </span>
                            {opt}
                            {opt === q.correctAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={fields.length === 0 || isSubmitting}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === "create" ? "Create Quiz" : "Update Quiz"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
