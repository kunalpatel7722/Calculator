// This is an AI-powered email validation flow.
// It validates email format and checks for disposable/temporary emails.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailValidationInputSchema = z.object({
  email: z.string().describe('The email address to validate.'),
});
export type EmailValidationInput = z.infer<typeof EmailValidationInputSchema>;

const EmailValidationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the email is valid and not disposable.'),
  reason: z.string().optional().describe('The reason the email is invalid, if applicable.'),
});
export type EmailValidationOutput = z.infer<typeof EmailValidationOutputSchema>;

export async function validateEmail(input: EmailValidationInput): Promise<EmailValidationOutput> {
  return validateEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emailValidationPrompt',
  input: {schema: EmailValidationInputSchema},
  output: {schema: EmailValidationOutputSchema},
  prompt: `You are an AI email validator. Determine if the provided email address is valid and not a disposable or temporary email.

  Email: {{{email}}}

  Respond with a JSON object indicating whether the email is valid and, if not, the reason.
  {
    "isValid": true|false,
    "reason": "reason for invalidity"
  }`,
});

const validateEmailFlow = ai.defineFlow(
  {
    name: 'validateEmailFlow',
    inputSchema: EmailValidationInputSchema,
    outputSchema: EmailValidationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error: any) {
      console.error('Email validation failed:', error);
      return {
        isValid: false,
        reason: 'An unexpected error occurred during validation.',
      };
    }
  }
);
