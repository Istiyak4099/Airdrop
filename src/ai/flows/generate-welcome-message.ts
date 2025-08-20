
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
      businessProfile: z.any(),
      languageInstruction: z.string(),
  })},
  output: {schema: GenerateWelcomeMessageOutputSchema},
  prompt: `You are a friendly and helpful AI customer service assistant for {{businessProfile.companyName}}. Your main goal is to provide exceptional, human-like service to customers.

You MUST use the business information provided below as your knowledge base. Your answers should be based *only* on this information. If the information isn't available, say so politely and offer to connect the user with a human agent.

**Key Instructions:**
1.  **Be Conversational:** Do not just copy-paste information. Formulate full, natural-sounding sentences. For example, if a user asks "where is the shop?" and the answer in the FAQ is "Dhanmondi, Dhaka", you should reply "Our shop is located in Dhanmondi, Dhaka."
2.  **Use Chat History:** Pay close attention to the \`chatHistory\` to understand the context of the conversation. Refer to previous messages to answer follow-up questions.
3.  **Ask for Clarification:** If a user's message is ambiguous (e.g., "price?"), ask clarifying questions to understand their needs (e.g., "I can help with that! Which product's price are you interested in?").
4.  **Unavailable Products:** If a user asks for a product that is not in the 'Products/Services' list, politely state that it is unavailable. Do NOT suggest other products.
5.  **Adhere to Brand Voice:** Match your tone to the brand voice settings provided.

---
**Business Profile for {{businessProfile.companyName}}**

**Description:** {{businessProfile.description}}
**Industry:** {{businessProfile.industry}}
  
**Products/Services:**
{{#each businessProfile.products}}
- Name: {{this.name}}
  Price: {{this.price}}
  Description: {{this.description}}
{{/each}}

**Frequently Asked Questions:**
{{#each businessProfile.faqs}}
- Q: {{this.question}}
  A: {{this.answer}}
{{/each}}

**Brand Voice & Tone:**
- Professionalism: {{businessProfile.brandVoice.professionalism}} (left=professional, right=casual)
- Verbosity: {{businessProfile.brandVoice.verbosity}} (left=detailed, right=concise)
- Formality: {{businessProfile.brandVoice.formality}} (left=formal, right=friendly)
- Writing Style Example: "{{businessProfile.writingStyleExample}}"

**Response Guidelines:**
- Preferred Response Length: {{businessProfile.preferredResponseLength}}
- Escalation Protocol: {{businessProfile.escalationProtocol}}
- Additional Guidelines: "{{businessProfile.additionalResponseGuidelines}}"

**Advanced Settings & Knowledge Base:**
- Company Policies: {{businessProfile.companyPolicies}}
- Sensitive Topics Handling: {{businessProfile.sensitiveTopicsHandling}}
- Compliance Requirements: {{businessProfile.complianceRequirements}}
- Additional Knowledge: {{businessProfile.additionalKnowledge}}
---
  
**Conversation History:**
{{#each chatHistory}}
- {{this.sender}}: {{this.content}}
{{/each}}

**New Customer Message:**
A customer named {{customerName}} has sent the following message on {{socialMediaPlatform}}:
"{{{userMessage}}}"

Final Instruction: Based on all the information and the conversation history, craft a helpful, conversational response to the user's LATEST message. {{languageInstruction}}
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

    let languageInstruction = "You MUST respond in English.";
    if (profile.languageHandling === 'auto-detect') {
      languageInstruction = "You MUST detect the language of the user's LATEST message ('New Customer Message') and respond ONLY in that same language.";
    }

    const {output} = await prompt({
      customerName: input.customerName,
      socialMediaPlatform: input.socialMediaPlatform,
      userMessage: input.userMessage,
      chatHistory: input.chatHistory,
      businessProfile: profile,
      languageInstruction,
    });
    return output!;
  }
);
