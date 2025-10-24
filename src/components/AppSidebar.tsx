"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, FileText, LogOut, Home } from "lucide-react";
import { Quiz } from "@/models/Quiz";
import { useEffect, useState } from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuizes = async () => {
      const res = await fetch("/api/quiz", { method: "GET" });
      const { quizzes: quizData } = await res.json();
      console.log(quizData);
      setQuizzes(quizData);
    };

    fetchQuizes();
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Quiz Admin</h2>
            <p className="text-xs text-muted-foreground">Manage your quizzes</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                  <Link href="/admin">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/quiz/new"}
                >
                  <Link href="/admin/quiz/new">
                    <Plus className="h-4 w-4" />
                    <span>Create New Quiz</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>All Quizzes ({quizzes.length})</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[400px]">
              <SidebarMenu>
                {quizzes.map((quiz) => (
                  <SidebarMenuItem key={quiz._id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/admin/quiz/${quiz._id}`}
                    >
                      <Link href={`/admin/quiz/${quiz._id}`}>
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{quiz.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
