// This is an AI-powered chatbot assistant that answers user queries related to the website and investment-related topics.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInputSchema = z.object({
  query: z.string().describe('The user query about the website or investment-related topics.'),
});

export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});

export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function aiChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return aiChatbotFlow(input);
}

const aiChatbotPrompt = ai.definePrompt({
  name: 'aiChatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a helpful AI chatbot assistant. Your role is to answer user queries related to the website and investment-related topics.
  Use your knowledge and web search to provide accurate and informative answers.

  User Query: {{{query}}}

  Answer:`, // Removed Handlebars helper for web search as it's not supported
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    const {output} = await aiChatbotPrompt(input);
    return output!;
  }
);
