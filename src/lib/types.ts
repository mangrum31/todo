export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Todo = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  completed: boolean;
  categoryId: string;
};
