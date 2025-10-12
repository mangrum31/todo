import { getTodos, getCategories } from '@/lib/data';
import { TaskBoard } from '@/components/app/task-board';

export default async function DashboardPage() {
  const initialTasks = await getTodos();
  const categories = await getCategories();

  return <TaskBoard initialTasks={initialTasks} categories={categories} />;
}
