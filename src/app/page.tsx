"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function Home() {
  return (
    <main>
      <header className="flex w-full p-4 bg-accent item-center justify-between">
        <h2 className="text-3xl font-bold">Ajackus Quiz App</h2>

        <nav>
          <Button onClick={() => signIn("google")}>
            <LogIn />
             Admin Login
          </Button>
        </nav>
      </header>
    </main>
  );
}
