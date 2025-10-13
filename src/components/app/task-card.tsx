'use client';

import { useTransition } from 'react';
import { format } from 'date-fns';
import { Calendar, Edit, MoreVertical, Trash2 } from 'lucide-react';
import type { Todo, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { deleteTask, toggleTaskCompletion } from '@/lib/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AddTask } from './add-task';

interface TaskCardProps {
  task: Todo;
  categories: Category[];
}

export function TaskCard({ task, categories }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const category = categories.find(c => c.id === task.categoryId);

  const handleToggleCompletion = () => {
    startTransition(async () => {
      await toggleTaskCompletion(task.id, !task.completed);
      toast({
        title: `Task ${task.completed ? 'marked as pending' : 'completed'}!`,
        description: task.title,
      });
    });
  };
  
  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
      toast({
        title: 'Task deleted',
        description: task.title,
        variant: 'destructive'
      })
    })
  }

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300 w-full',
        task.completed ? 'bg-card/50 border-dashed' : 'bg-card',
        isPending && 'opacity-50'
      )}
    >
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleCompletion}
          aria-label="Mark task as complete"
          className="mt-1"
        />
        <div className="flex-1">
          <CardTitle
            className={cn(
              'text-lg',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </CardTitle>
          <CardDescription
            className={cn('text-base',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.description}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <AddTask task={task} categories={categories}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            </AddTask>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardFooter className="mt-auto flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {task.dueDate && (
            <>
              <Calendar className="h-4 w-4" />
              <span>{format(task.dueDate, 'MMM d, yyyy')}</span>
            </>
          )}
        </div>
        {category && (
           <Badge
            style={{ backgroundColor: category.color }}
            className={cn('text-white', task.completed && 'bg-opacity-50')}
          >
            {category.name}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
