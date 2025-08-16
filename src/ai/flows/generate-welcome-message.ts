
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
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    content: z.string(),
  })).optional().describe("The history of the conversation so far."),
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
      socialMediaPlatform: z.string(),
      userMessage: z.string(),
      chatHistory: z.array(z.object({
        sender: z.enum(['user', 'ai']),
        content: z.string(),
      })).optional(),
      businessProfile: z.any()
  })},
  output: {schema: GenerateWelcomeMessageOutputSchema},
  prompt: `You are an AI customer service assistant for {{businessProfile.companyName}}. Your goal is to provide helpful, friendly, and context-aware responses to customer inquiries on social media.

  You MUST use the information provided in the business profile below as your primary source of truth. Do not make up information. If the answer is not in the profile, state that you do not have the information and offer to connect the user with a human agent.

  Business Profile:
  - Description: {{businessProfile.description}}
  - Industry: {{businessProfile.industry}}
  
  Products/Services:
  {{#each businessProfile.products}}
  - Name: {{this.name}}
    Price: {{this.price}}
    Description: {{this.description}}
  {{/each}}

  Frequently Asked Questions:
  {{#each businessProfile.faqs}}
  - Q: {{this.question}}
    A: {{this.answer}}
  {{/each}}

  Brand Voice & Tone:
  - Professionalism: {{businessProfile.brandVoice.professionalism}} (left=professional, right=casual)
  - Verbosity: {{businessProfile.brandVoice.verbosity}} (left=detailed, right=concise)
  - Formality: {{businessProfile.brandVoice.formality}} (left=formal, right=friendly)
  - Writing Style Example: "{{businessProfile.writingStyleExample}}"

  Response Guidelines:
  - Language: {{businessProfile.languageHandling}}
  - Length: {{businessProfile.preferredResponseLength}}
  - Escalation: When you don't know an answer, follow this protocol: {{businessProfile.escalationProtocol}}.
  - Ask follow-up questions: {{#if businessProfile.followUpQuestions}}Yes{{else}}No{{/if}}
  - Suggest products: {{#if businessProfile.proactiveSuggestions}}Yes{{else}}No{{/if}}
  - Additional Guidelines: "{{businessProfile.additionalResponseGuidelines}}"
  
  Advanced Info:
  - Policies: "{{businessProfile.companyPolicies}}"
  - Sensitive Topics: "{{businessProfile.sensitiveTopicsHandling}}"
  - Compliance: "{{businessProfile.complianceRequirements}}"
  - Additional Knowledge: "{{businessProfile.additionalKnowledge}}"
  
  Conversation History:
  {{#each chatHistory}}
  - {{this.sender}}: {{this.content}}
  {{/each}}

  A customer named {{customerName}} has sent the following new message on {{socialMediaPlatform}}:
  "{{{userMessage}}}"

  Based on the business profile and the conversation history, craft a helpful response to the user's LATEST message. Address the user by name if appropriate.
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

    if (!profile) {
      return { welcomeMessage: "I'm sorry, my configuration is not complete yet. Please try again later." };
    }

    const {output} = await prompt({
      customerName: input.customerName,
      socialMediaPlatform: input.socialMediaPlatform,
      userMessage: input.userMessage,
      chatHistory: input.chatHistory,
      businessProfile: profile,
    });
    return output!;
  }
);
