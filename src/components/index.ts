import dynamic from "next/dynamic";

const AppSidebar = dynamic(() => import("./AppSidebar").then((f) => f.default));
const QuizForm = dynamic(() => import("./QuizForm").then((m) => m.default));

export { AppSidebar, QuizForm };
