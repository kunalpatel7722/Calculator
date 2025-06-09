// predictive-analytics.ts
'use server';
/**
 * @fileOverview AI-powered predictive analytics flow for investment projections.
 *
 * - getInvestmentProjection - A function that provides potential investment projections based on historical data.
 * - InvestmentProjectionInput - The input type for the getInvestmentProjection function.
 * - InvestmentProjectionOutput - The return type for the getInvestmentProjection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestmentProjectionInputSchema = z.object({
  investmentType: z
    .string()
    .describe(
      'The type of investment (e.g., stock, crypto, real estate, mutual fund).' 
    ),
  historicalData: z
    .string()
    .describe(
      'Historical data of the investment as a JSON string. Include fields like date and closing price.'
    ),
  projectionHorizon: z
    .string()
    .describe(
      'The projection horizon in months or years (e.g., 6 months, 2 years).'
    ),
  riskTolerance: z
    .string()
    .describe(
      'The investors risk tolerance (e.g., low, medium, high). This will affect the projection ranges.'
    ),
});

export type InvestmentProjectionInput = z.infer<typeof InvestmentProjectionInputSchema>;

const InvestmentProjectionOutputSchema = z.object({
  projectionSummary: z
    .string()
    .describe(
      'A summary of the projected investment performance over the specified horizon.'
    ),
  projectedRange: z.object({
    optimistic: z
      .string()
      .describe(
        'An optimistic estimate of the investment value at the end of the projection horizon.'
      ),
    pessimistic: z
      .string()
      .describe(
        'A pessimistic estimate of the investment value at the end of the projection horizon.'
      ),
    mostLikely: z
      .string()
      .describe(
        'The most likely estimate of the investment value at the end of the projection horizon.'
      ),
  }),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer stating that the projections are based on historical data and AI and are not financial advice.'
    ),
});

export type InvestmentProjectionOutput = z.infer<typeof InvestmentProjectionOutputSchema>;

export async function getInvestmentProjection(
  input: InvestmentProjectionInput
): Promise<InvestmentProjectionOutput> {
  return investmentProjectionFlow(input);
}

const investmentProjectionPrompt = ai.definePrompt({
  name: 'investmentProjectionPrompt',
  input: {schema: InvestmentProjectionInputSchema},
  output: {schema: InvestmentProjectionOutputSchema},
  prompt: `You are an AI-powered investment projection tool. You take historical data, investment type, projection horizon and risk tolerance as input.  

  Based on the historical data:
  {{historicalData}}
  
  For the investment type: {{investmentType}}
  Over a period of: {{projectionHorizon}}
  Given a risk tolerance of: {{riskTolerance}}
  
  Provide a projection summary with an optimistic, pessimistic and most likely range for the investment. Also include a disclaimer that these are AI-based projections and not financial advice.
  `,
});

const investmentProjectionFlow = ai.defineFlow(
  {
    name: 'investmentProjectionFlow',
    inputSchema: InvestmentProjectionInputSchema,
    outputSchema: InvestmentProjectionOutputSchema,
  },
  async input => {
    const {output} = await investmentProjectionPrompt(input);
    return output!;
  }
);
