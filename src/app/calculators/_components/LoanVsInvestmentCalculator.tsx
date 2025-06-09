
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyToggle, AVAILABLE_CURRENCIES, type Currency } from '@/components/shared/CurrencyToggle';

const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Loan amount must be greater than 0"),
  loanInterestRate: z.coerce.number().min(0, "Loan interest rate must be non-negative").max(100),
  investmentReturnRate: z.coerce.number().min(0, "Investment return rate must be non-negative").max(100),
  periodYears: z.coerce.number().min(1, "Period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  costOfLoan: number; // Total interest paid over period
  potentialInvestmentGrowth: number; // Growth if loanAmount was invested
  netDifference: number; // investmentGrowth - costOfLoan
  decisionGuidance: string;
}

export function LoanVsInvestmentCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { loanAmount: 10000, loanInterestRate: 5, investmentReturnRate: 7, periodYears: 5 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Simplified calculations for demonstration
    const rLoan = data.loanInterestRate / 100;
    const rInvest = data.investmentReturnRate / 100;
    const t = data.periodYears;
    const P = data.loanAmount;

    // Assuming simple interest for loan cost for simplicity, real loan cost involves amortization
    const costOfLoanSimple = P * rLoan * t;

    // Assuming compound interest for investment growth
    const potentialInvestmentGrowthValue = P * Math.pow(1 + rInvest, t);
    const investmentGain = potentialInvestmentGrowthValue - P;

    const netDifference = investmentGain - costOfLoanSimple;
    let decisionGuidance = "";
    if (netDifference > 0) {
        decisionGuidance = `Investing appears potentially more beneficial by ${currency.symbol}${netDifference.toLocaleString()} over ${t} years (Simplified).`;
    } else if (netDifference < 0) {
        decisionGuidance = `Paying off the loan appears potentially more beneficial by ${currency.symbol}${Math.abs(netDifference).toLocaleString()} over ${t} years (Simplified).`;
    } else {
        decisionGuidance = "The outcomes are roughly similar based on these simplified calculations.";
    }


    setResult({ 
        costOfLoan: parseFloat(costOfLoanSimple.toFixed(2)),
        potentialInvestmentGrowth: parseFloat(investmentGain.toFixed(2)),
        netDifference: parseFloat(netDifference.toFixed(2)),
        decisionGuidance
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Loan vs. Investment Calculator</CardTitle>
        <CardDescription>Compare paying off loans vs. investing the same amount. (Simplified)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="loanAmount">Amount to Pay Loan / Invest ({currency.symbol})</Label>
            <Input id="loanAmount" type="number" step="any" {...form.register('loanAmount')} />
            {form.formState.errors.loanAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.loanAmount.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="loanInterestRate">Loan Annual Interest Rate (%)</Label>
              <Input id="loanInterestRate" type="number" step="any" {...form.register('loanInterestRate')} />
              {form.formState.errors.loanInterestRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.loanInterestRate.message}</p>}
            </div>
            <div>
              <Label htmlFor="investmentReturnRate">Expected Annual Investment Return Rate (%)</Label>
              <Input id="investmentReturnRate" type="number" step="any" {...form.register('investmentReturnRate')} />
              {form.formState.errors.investmentReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentReturnRate.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="periodYears">Comparison Period (Years)</Label>
            <Input id="periodYears" type="number" {...form.register('periodYears')} />
            {form.formState.errors.periodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.periodYears.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Currency</Label>
            <CurrencyToggle
              id="currency-toggle"
              selectedCurrency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Compare</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Comparison Results (Simplified)</h3>
          <p><strong>Estimated Cost of Loan (Interest Paid):</strong> {currency.symbol}{result.costOfLoan.toLocaleString()}</p>
          <p><strong>Potential Investment Gain:</strong> {currency.symbol}{result.potentialInvestmentGrowth.toLocaleString()}</p>
          <p><strong>Net Difference (Investment Gain - Loan Cost):</strong> {currency.symbol}{result.netDifference.toLocaleString()}</p>
          <p className="mt-2 font-semibold">{result.decisionGuidance}</p>
          <p className="text-xs mt-2 text-muted-foreground">Note: This is a simplified comparison. Real loan calculations involve amortization. Investment returns are not guaranteed.</p>
        </div>
      )}
    </Card>
  );
}
