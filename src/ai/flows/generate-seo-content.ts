
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

If generating content for a calculator's descriptive section (i.e., when {{calculatorName}} refers to a specific calculator like "Compound Interest Calculator"):
- Include a detailed explanation of the calculator.
- Describe the finance and investment calculations involved.
- Explain how it works.
- Highlight how the user can benefit from using it.
- In this context, avoid linking to the calculator itself, but you may link to other distinct, related calculators if highly relevant and natural.

When generating content for a blog post or an article (e.g., when '{{calculatorName}}' includes "Blog Post:", "Guide to:", or broadly discusses a financial topic):
- It is important to include relevant inbound Markdown links to specific calculators on the InvestAI website whenever the text discusses concepts that a calculator can help with.
- For instance, if 'compound interest' is mentioned, link to '[our Compound Interest Calculator](/calculators/compound-interest)'.
- If 'Bitcoin investment returns' are discussed, link to '[the Bitcoin ROI calculator](/calculators/bitcoin-roi)'.
- If the topic is 'Systematic Investment Plans', link to '[the SIP Calculator](/calculators/sip-calculator)'.
- Use the format: \`[Link Text](/calculators/calculator-id)\`. Ensure \`calculator-id\` matches the IDs used in the application (e.g., 'compound-interest', 'bitcoin-roi', 'sip-calculator', 'stock-return', 'dividend-yield', etc.).
- These links should be integrated naturally within the flow of the text to provide value to the reader.
- Also, include suggestions for 1-2 outbound Markdown links to authoritative external resources using placeholder URLs. For example: 'For further details, consult [Reputable Financial News Source](placeholder-external-link-financial-news) or [Official Government Finance Guide](placeholder-external-link-gov-finance)'. Do NOT use real URLs, only placeholders like 'placeholder-external-link-[topic]'.

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

