'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { saveTodo, deleteTodoById, getTodos } from './data';
import type { Todo } from './types';
import { detectConflicts } from '@/ai/flows/scheduled-task-conflict-detection';

const todoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  dueDate: z.date().nullable(),
  completed: z.boolean(),
});

export async function upsertTask(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = todoSchema.safeParse({
    ...values,
    id: values.id || undefined,
    dueDate: values.dueDate ? new Date(values.dueDate as string) : null,
    completed: values.completed === 'true',
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const taskData: Omit<Todo, 'id'> & { id?: string } = parsed.data;

  const task: Todo = {
    id: taskData.id || Date.now().toString(),
    ...taskData,
  };
  
  await saveTodo(task);

  revalidatePath('/dashboard');
  revalidatePath('/reports');

  return { task };
}

export async function toggleTaskCompletion(id: string, completed: boolean) {
  const todos = await getTodos();
  const todo = todos.find(t => t.id === id);

  if (todo) {
    await saveTodo({ ...todo, completed });
    revalidatePath('/dashboard');
    revalidatePath('/reports');
  }
}

export async function deleteTask(id: string) {
  await deleteTodoById(id);
  revalidatePath('/dashboard');
  revalidatePath('/reports');
}


export async function checkScheduleConflicts() {
    const tasks = await getTodos();
    const scheduledTasks = tasks
        .filter(task => task.dueDate && !task.completed)
        .map(task => ({
            title: task.title,
            // Assuming 1 hour duration for each task, starting at the due date time.
            startTime: task.dueDate!.toISOString(),
            endTime: new Date(task.dueDate!.getTime() + 60 * 60 * 1000).toISOString()
        }));

    if (scheduledTasks.length < 2) {
        return { conflicts: [] };
    }
    
    try {
        const result = await detectConflicts({ tasks: scheduledTasks });
        return result;
    } catch (error) {
        console.error("Error detecting conflicts:", error);
        return { conflicts: [], error: "Failed to check for conflicts." };
    }
}
