'use client';

import { useState, useTransition } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { checkScheduleConflicts } from '@/lib/actions';
import type { ConflictDetectionOutput } from '@/ai/flows/scheduled-task-conflict-detection';
import type { Todo } from '@/lib/types';
import { format } from 'date-fns';

interface ConflictCheckerProps {
  tasks: Todo[];
}

export function ConflictChecker({ tasks }: ConflictCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ConflictDetectionOutput | null>(null);

  const handleCheck = () => {
    startTransition(async () => {
      const res = await checkScheduleConflicts();
      setResult(res);
      setIsOpen(true);
    });
  };

  const hasScheduledTasks = tasks.some(task => task.dueDate && !task.completed);

  return (
    <>
      <Button onClick={handleCheck} disabled={isPending || !hasScheduledTasks} >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Bot className="mr-2 h-4 w-4" />
        )}
        Check Conflicts
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Schedule Conflict Analysis</AlertDialogTitle>
            {result && result.conflicts.length > 0 ? (
                <AlertDialogDescription>
                    The following potential conflicts were found in your schedule:
                </AlertDialogDescription>
            ) : (
                <AlertDialogDescription>
                    No conflicts found! Your schedule is clear.
                </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          {result && result.conflicts.length > 0 && (
            <div className="max-h-60 overflow-y-auto pr-4">
              <ul className="space-y-4">
                {result.conflicts.map((conflict, index) => (
                    <li key={index} className="p-3 bg-muted/50 rounded-lg border">
                        <p className="font-semibold text-destructive">Conflict Found:</p>
                        <p><strong>{conflict.task1}</strong> ({format(new Date(conflict.startTime1), 'p, MMM d')})</p>
                        <p>overlaps with</p>
                        <p><strong>{conflict.task2}</strong> ({format(new Date(conflict.startTime2), 'p, MMM d')})</p>
                    </li>
                ))}
              </ul>
            </div>
          )}
          {result?.error && (
             <p className="text-sm text-destructive">{result.error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
