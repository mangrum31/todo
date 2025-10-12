'use client';

import { useState, useMemo } from 'react';
import { isThisWeek, isThisMonth, parseISO } from 'date-fns';
import type { Todo, Category } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TaskCard } from './task-card';
import { ConflictChecker } from './conflict-checker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterStatus = 'all' | 'pending' | 'completed';
type GroupBy = 'none' | 'week' | 'month' | 'category';

interface TaskBoardProps {
  initialTasks: Todo[];
  categories: Category[];
}

export function TaskBoard({ initialTasks, categories }: TaskBoardProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  const filteredTasks = useMemo(() => {
    return initialTasks.filter(task => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
  }, [initialTasks, filter]);

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': filteredTasks };
    }
    const groups: Record<string, Todo[]> = {};

    filteredTasks.forEach(task => {
      let key: string;
      if (groupBy === 'category') {
        const category = categories.find(c => c.id === task.categoryId);
        key = category?.name || 'Uncategorized';
      } else if (groupBy === 'week') {
        key =
          task.dueDate && isThisWeek(task.dueDate, { weekStartsOn: 1 })
            ? 'This Week'
            : 'Other Weeks';
      } else if (groupBy === 'month') {
        key =
          task.dueDate && isThisMonth(task.dueDate)
            ? 'This Month'
            : 'Other Months';
      } else {
        key = 'All Tasks';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });

    return groups;
  }, [filteredTasks, groupBy, categories]);

  const defaultAccordionValues = Object.keys(groupedTasks);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={filter} onValueChange={value => setFilter(value as FilterStatus)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Group by:</label>
          <Select value={groupBy} onValueChange={value => setGroupBy(value as GroupBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <ConflictChecker tasks={initialTasks} />
        </div>
      </div>
      
      <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-4">
        {Object.entries(groupedTasks).map(([groupName, tasks]) => (
          <AccordionItem value={groupName} key={groupName} className="border-b-0">
            <AccordionTrigger className="text-lg font-semibold bg-card p-4 rounded-t-lg">
                {groupName} ({tasks.length})
            </AccordionTrigger>
            <AccordionContent className="bg-card p-4 rounded-b-lg">
              {tasks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tasks
                    .sort((a, b) => (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity))
                    .map(task => (
                      <TaskCard key={task.id} task={task} categories={categories} />
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No tasks in this group.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
