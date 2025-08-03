'use server';

/**
 * @fileOverview AI agent that generates personalized welcome messages for new customers.
 *
 * - generateWelcomeMessage - A function that generates a welcome message.
 * - GenerateWelcomeMessageInput - The input type for the generateWelcomeMessage function.
 * - GenerateWelcomeMessageOutput - The return type for the generateWelcomeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWelcomeMessageInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  businessName: z.string().describe('The name of the business.'),
  socialMediaPlatform: z.string().describe('The social media platform where the interaction is taking place (e.g., Facebook, Instagram).'),
});
export type GenerateWelcomeMessageInput = z.infer<typeof GenerateWelcomeMessageInputSchema>;

const GenerateWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe('The personalized welcome message for the customer.'),
});
export type GenerateWelcomeMessageOutput = z.infer<typeof GenerateWelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: GenerateWelcomeMessageInput): Promise<GenerateWelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWelcomeMessagePrompt',
  input: {schema: GenerateWelcomeMessageInputSchema},
  output: {schema: GenerateWelcomeMessageOutputSchema},
  prompt: `You are an AI assistant that crafts personalized welcome messages for new customers interacting with businesses on social media.

  Given the following information, generate a warm and engaging welcome message:

  Customer Name: {{{customerName}}}
  Business Name: {{{businessName}}}
  Social Media Platform: {{{socialMediaPlatform}}}

  Welcome Message:`, // No Handlebars in prompt.
});

const generateWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeMessageFlow',
    inputSchema: GenerateWelcomeMessageInputSchema,
    outputSchema: GenerateWelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
