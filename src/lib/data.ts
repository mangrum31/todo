'use server';

import type { Todo, Category } from './types';

const categoriesData: Category[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#22c55e' },
  { id: 'errands', name: 'Errands', color: '#eab308' },
];

const now = new Date();
const todosData: Todo[] = [
  {
    id: '1',
    title: 'Finish project proposal',
    description: 'Complete the proposal for the new client. Needs to include Q3 financial projections.',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
    completed: false,
    categoryId: 'work',
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, and cheese.',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    completed: false,
    categoryId: 'errands',
  },
  {
    id: '3',
    title: 'Go for a run',
    description: '5k run in the park.',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    completed: true,
    categoryId: 'personal',
  },
  {
    id: '4',
    title: 'Schedule dentist appointment',
    description: '',
    dueDate: null,
    completed: false,
    categoryId: 'personal',
  },
  {
    id: '5',
    title: 'Team meeting',
    description: 'Weekly sync with the development team.',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    completed: false,
    categoryId: 'work',
  },
  {
    id: '6',
    title: 'Pay electricity bill',
    description: 'Due by the end of the week.',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
    completed: false,
    categoryId: 'errands',
  },
  {
    id: '7',
    title: 'Read a chapter of a book',
    description: 'Chapter 4 of "The Pragmatic Programmer".',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    completed: true,
    categoryId: 'personal',
  },
  {
    id: '8',
    title: 'Review Q2 performance metrics',
    description: 'Analyze the team performance data and prepare a summary report.',
    dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
    completed: false,
    categoryId: 'work',
  },
];

// In a real app, you'd fetch this from a database.
// For this demo, we'll use in-memory arrays.
let todos: Todo[] = [...todosData];
let categories: Category[] = [...categoriesData];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getTodos(): Promise<Todo[]> {
  await delay(100);
  return todos.map(t => ({...t, dueDate: t.dueDate ? new Date(t.dueDate) : null}));
}

export async function getCategories(): Promise<Category[]> {
  await delay(100);
  return categories;
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
  await delay(50);
  const todo = todos.find(t => t.id === id);
  return todo ? {...todo, dueDate: todo.dueDate ? new Date(todo.dueDate) : null} : undefined;
}

export async function saveTodo(todo: Todo): Promise<Todo> {
    await delay(200);
    const existingIndex = todos.findIndex(t => t.id === todo.id);
    if (existingIndex > -1) {
        todos[existingIndex] = todo;
    } else {
        todos.unshift(todo);
    }
    return todo;
}

export async function deleteTodoById(id: string): Promise<void> {
    await delay(200);
    todos = todos.filter(t => t.id !== id);
}
