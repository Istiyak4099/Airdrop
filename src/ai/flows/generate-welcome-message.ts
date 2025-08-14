
'use server';

/**
 * @fileOverview AI agent that generates personalized welcome messages for new customers.
 *
 * - generateWelcomeMessage - A function that generates a welcome message.
 * - GenerateWelcomeMessageInput - The input type for the generateWelcomeMessage function.
 * - GenerateWelcomeMessageOutput - The return type for the generateWelcomeMessage function.
 */

import {ai} from '@/ai/genkit';
import { getBusinessProfile } from '@/services/business-profile-service';
import {z} from 'genkit';

const GenerateWelcomeMessageInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  socialMediaPlatform: z.string().describe('The social media platform where the interaction is taking place (e.g., Facebook, Instagram).'),
  userMessage: z.string().describe('The user\'s message to the business.'),
  userId: z.string().describe("The user's unique ID."),
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
  input: {schema: z.object({
    customerName: z.string(),
    businessName: z.string(),
    socialMediaPlatform: z.string(),
    userMessage: z.string(),
    businessDescription: z.string().optional(),
  })},
  output: {schema: GenerateWelcomeMessageOutputSchema},
  prompt: `You are an AI assistant for {{businessName}}. Your goal is to provide helpful and friendly responses to customer inquiries on social media. Your response should be based on the business description.

  Here is some information about the business:
  {{#if businessDescription}}
  Business Description: {{{businessDescription}}}
  {{else}}
  No business description provided. You should state that you do not have enough information.
  {{/if}}
  
  A customer named {{customerName}} has sent the following message on {{socialMediaPlatform}}:
  "{{{userMessage}}}"

  Based on the business information and the customer's message, craft a helpful and welcoming response. Do not say things like "This is a test response".
  `,
});

const generateWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeMessageFlow',
    inputSchema: GenerateWelcomeMessageInputSchema,
    outputSchema: GenerateWelcomeMessageOutputSchema,
  },
  async (input) => {
    const { userId } = input;
    if (!userId) {
        throw new Error('User not authenticated');
    } 
    const profile = await getBusinessProfile(userId);

    const {output} = await prompt({
      customerName: input.customerName,
      socialMediaPlatform: input.socialMediaPlatform,
      userMessage: input.userMessage,
      businessName: profile?.companyName || "the business",
      businessDescription: profile?.description,
    });
    return output!;
  }
);
