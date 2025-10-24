"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main>
      <Button onClick={() => signIn("google")}>Signup</Button>
    </main>
  );
}
