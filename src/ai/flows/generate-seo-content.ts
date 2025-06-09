// src/ai/flows/generate-seo-content.ts
'use server';

/**
 * @fileOverview Generates SEO-optimized content for investment calculators.
 *
 * - generateSeoContent - A function that generates SEO content.
 * - GenerateSeoContentInput - The input type for the generateSeoContent function.
 * - GenerateSeoContentOutput - The return type for the generateSeoContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoContentInputSchema = z.object({
  calculatorName: z
    .string()
    .describe('The name of the calculator for which to generate content.'),
  keywords: z.string().describe('Relevant keywords for the calculator.'),
});
export type GenerateSeoContentInput = z.infer<typeof GenerateSeoContentInputSchema>;

const GenerateSeoContentOutputSchema = z.object({
  title: z.string().describe('The SEO-optimized title for the content.'),
  content: z.string().describe('The SEO-optimized content for the calculator.'),
});
export type GenerateSeoContentOutput = z.infer<typeof GenerateSeoContentOutputSchema>;

export async function generateSeoContent(input: GenerateSeoContentInput): Promise<GenerateSeoContentOutput> {
  return generateSeoContentFlow(input);
}

const generateSeoContentPrompt = ai.definePrompt({
  name: 'generateSeoContentPrompt',
  input: {schema: GenerateSeoContentInputSchema},
  output: {schema: GenerateSeoContentOutputSchema},
  prompt: `You are an SEO expert specializing in creating content for financial calculators.

  Generate SEO-optimized content for the {{calculatorName}} calculator, using the following keywords: {{keywords}}.
  The content should be informative, engaging, and optimized for search engines.
  The content should include a title and a body. The title and content should be SEO optimized to rank on google.
  The content must be related to finance and investment.
  The generated content should include a detailed explanation of the calculator and the finance and investment calculations involved.
  The content must contain an explanation of how the calculator works and how the user can benefit from using it.

  Ensure that the content is original and not plagiarized.
  `,
});

const generateSeoContentFlow = ai.defineFlow(
  {
    name: 'generateSeoContentFlow',
    inputSchema: GenerateSeoContentInputSchema,
    outputSchema: GenerateSeoContentOutputSchema,
  },
  async input => {
    const {output} = await generateSeoContentPrompt(input);
    return output!;
  }
);
