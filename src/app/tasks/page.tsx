import type { Metadata } from "next";
import TaskDashboard from "@/components/TaskDashboard";

export const metadata: Metadata = {
  title: "Công việc · Việc học của tôi",
};

export default function TasksPage() {
  return <TaskDashboard />;
}
