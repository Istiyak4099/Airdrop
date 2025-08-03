 'use server';

/**
 * @fileOverview An AI agent that suggests quick replies based on the latest customer message.
 *
 * - suggestQuickReplies - A function that suggests quick replies based on the latest customer message.
 * - SuggestQuickRepliesInput - The input type for the suggestQuickReplies function.
 * - SuggestQuickRepliesOutput - The return type for the suggestQuickReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQuickRepliesInputSchema = z.object({
  latestCustomerMessage: z
    .string()
    .describe('The latest message from the customer.'),
});
export type SuggestQuickRepliesInput = z.infer<typeof SuggestQuickRepliesInputSchema>;

const SuggestQuickRepliesOutputSchema = z.object({
  quickReplies: z
    .array(z.string())
    .describe('An array of suggested quick replies.'),
});
export type SuggestQuickRepliesOutput = z.infer<typeof SuggestQuickRepliesOutputSchema>;

export async function suggestQuickReplies(input: SuggestQuickRepliesInput): Promise<SuggestQuickRepliesOutput> {
  return suggestQuickRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestQuickRepliesPrompt',
  input: {schema: SuggestQuickRepliesInputSchema},
  output: {schema: SuggestQuickRepliesOutputSchema},
  prompt: `You are an AI assistant helping to suggest quick replies for customer messages.
  Based on the latest customer message, suggest 3 relevant quick replies.
  Do not include any conversational text, only return the array of strings.
  Latest Customer Message: {{{latestCustomerMessage}}}`,
});

const suggestQuickRepliesFlow = ai.defineFlow(
  {
    name: 'suggestQuickRepliesFlow',
    inputSchema: SuggestQuickRepliesInputSchema,
    outputSchema: SuggestQuickRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
