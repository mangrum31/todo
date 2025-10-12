import { getTodos, getCategories } from '@/lib/data';
import { ReportCharts } from '@/components/app/report-charts';

export default async function ReportsPage() {
  const tasks = await getTodos();
  const categories = await getCategories();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Task Statistics</h2>
      <ReportCharts tasks={tasks} categories={categories} />
    </div>
  );
}
