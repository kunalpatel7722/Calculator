// src/ai/flows/generate-seo-content.ts
'use server';

/**
 * @fileOverview Generates SEO-optimized content for investment calculators and blog posts.
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
    .describe('The name of the calculator or blog topic for which to generate content.'),
  keywords: z.string().describe('Relevant keywords for the content.'),
});
export type GenerateSeoContentInput = z.infer<typeof GenerateSeoContentInputSchema>;

const GenerateSeoContentOutputSchema = z.object({
  title: z.string().describe('The SEO-optimized title for the content.'),
  content: z.string().describe('The SEO-optimized content, potentially including Markdown links.'),
});
export type GenerateSeoContentOutput = z.infer<typeof GenerateSeoContentOutputSchema>;

export async function generateSeoContent(input: GenerateSeoContentInput): Promise<GenerateSeoContentOutput> {
  return generateSeoContentFlow(input);
}

const generateSeoContentPrompt = ai.definePrompt({
  name: 'generateSeoContentPrompt',
  input: {schema: GenerateSeoContentInputSchema},
  output: {schema: GenerateSeoContentOutputSchema},
  prompt: `You are an SEO expert specializing in creating content for financial calculators and related blog posts.

Generate SEO-optimized content for "{{calculatorName}}" (this could be a calculator name or a blog post topic), using the following keywords: {{keywords}}.
The content should be informative, engaging, and optimized for search engines.
The content should include a title and a body. The title and content should be SEO optimized to rank on Google.
The content must be related to finance and investment.

If generating content for a calculator, include a detailed explanation of the calculator, the finance and investment calculations involved, how it works, and how the user can benefit from it.

If generating content for a blog post:
- Naturally integrate inbound Markdown links to relevant calculators on the InvestAI website. For example, if discussing 'compound interest', you could link to '[our Compound Interest Calculator](/calculators/compound-interest)'. Other calculator paths might include '/calculators/bitcoin-roi', '/calculators/sip-calculator', etc., as appropriate for the topic.
- Include suggestions for 1-2 outbound Markdown links to authoritative external resources using placeholder URLs. For example: 'For further details, consult [Reputable Financial News Source](placeholder-external-link-financial-news) or [Official Government Finance Guide](placeholder-external-link-gov-finance)'. Do NOT use real URLs, only placeholders like 'placeholder-external-link-[topic]'.

Ensure that the content is original and not plagiarized.
Format important headings using Markdown (e.g., ## Main Section, ### Sub-section). Use Markdown for bold (**text**) and italics (*text*) for emphasis.
Structure the content with paragraphs.
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

