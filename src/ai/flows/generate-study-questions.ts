'use server';

/**
 * @fileOverview A study question generation AI agent.
 *
 * - generateStudyQuestions - A function that handles the study question generation process.
 * - GenerateStudyQuestionsInput - The input type for the generateStudyQuestions function.
 * - GenerateStudyQuestionsOutput - The return type for the generateStudyQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyQuestionsInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document for which to generate study questions.'),
});
export type GenerateStudyQuestionsInput = z.infer<typeof GenerateStudyQuestionsInputSchema>;

const GenerateStudyQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of study questions generated from the document content.'),
});
export type GenerateStudyQuestionsOutput = z.infer<typeof GenerateStudyQuestionsOutputSchema>;

export async function generateStudyQuestions(input: GenerateStudyQuestionsInput): Promise<GenerateStudyQuestionsOutput> {
  return generateStudyQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyQuestionsPrompt',
  input: {schema: GenerateStudyQuestionsInputSchema},
  output: {schema: GenerateStudyQuestionsOutputSchema},
  prompt: `You are an expert educator. Generate study questions based on the following document content:\n\n{{{documentContent}}}\n\nEnsure the questions are comprehensive and cover the key concepts in the document.\nReturn the questions as a JSON array of strings.`,
});

const generateStudyQuestionsFlow = ai.defineFlow(
  {
    name: 'generateStudyQuestionsFlow',
    inputSchema: GenerateStudyQuestionsInputSchema,
    outputSchema: GenerateStudyQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
