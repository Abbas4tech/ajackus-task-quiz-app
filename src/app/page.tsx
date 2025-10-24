"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import AdminMCQForm from "@/components/AdminPanel";
import QuizFormComponent from "@/components/QuizForm";

export default function Home() {
  return (
    <main>
      <Button onClick={() => signIn("google")}>Signup</Button>
      <QuizFormComponent mode="create" />
    </main>
  );
}
