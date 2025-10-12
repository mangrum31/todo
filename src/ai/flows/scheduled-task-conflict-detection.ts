'use server';

/**
 * @fileOverview Detects potential time conflicts in a user's schedule.
 *
 * - detectConflicts - A function that analyzes scheduled tasks and identifies potential time conflicts.
 * - ConflictDetectionInput - The input type for the detectConflicts function, representing a list of scheduled tasks.
 * - ConflictDetectionOutput - The return type for the detectConflicts function, providing a list of potential time conflicts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConflictDetectionInputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe('The title of the task.'),
      startTime: z.string().describe('The start time of the task (ISO format).'),
      endTime: z.string().describe('The end time of the task (ISO format).'),
    })
  ).describe('A list of scheduled tasks with their titles, start times, and end times.'),
});
export type ConflictDetectionInput = z.infer<typeof ConflictDetectionInputSchema>;

const ConflictDetectionOutputSchema = z.object({
  conflicts: z.array(
    z.object({
      task1: z.string().describe('The title of the first conflicting task.'),
      task2: z.string().describe('The title of the second conflicting task.'),
      startTime1: z.string().describe('The start time of the first conflicting task (ISO format).'),
      endTime1: z.string().describe('The end time of the first conflicting task (ISO format).'),
      startTime2: z.string().describe('The start time of the second conflicting task (ISO format).'),
      endTime2: z.string().describe('The end time of the second conflicting task (ISO format).'),
    })
  ).describe('A list of potential time conflicts between tasks.'),
});
export type ConflictDetectionOutput = z.infer<typeof ConflictDetectionOutputSchema>;

export async function detectConflicts(input: ConflictDetectionInput): Promise<ConflictDetectionOutput> {
  return detectConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conflictDetectionPrompt',
  input: {schema: ConflictDetectionInputSchema},
  output: {schema: ConflictDetectionOutputSchema},
  prompt: `You are an AI assistant that analyzes a user's schedule and identifies potential time conflicts between tasks.

  Analyze the following list of tasks and identify any conflicts where tasks overlap in time. Provide a list of these conflicts.

  Tasks:
  {{#each tasks}}
  - Title: {{this.title}}, Start Time: {{this.startTime}}, End Time: {{this.endTime}}
  {{/each}}

  Output the conflicts in the following JSON format:
  {
    "conflicts": [
      {
        "task1": "Title of first conflicting task",
        "task2": "Title of second conflicting task",
        "startTime1": "Start time of first conflicting task (ISO format)",
        "endTime1": "End time of first conflicting task (ISO format)",
        "startTime2": "Start time of second conflicting task (ISO format)",
        "endTime2": "End time of second conflicting task (ISO format)"
      }
    ]
  }
`,
});

const detectConflictsFlow = ai.defineFlow(
  {
    name: 'detectConflictsFlow',
    inputSchema: ConflictDetectionInputSchema,
    outputSchema: ConflictDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
