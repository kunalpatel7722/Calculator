
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
  initialInvestment: z.coerce.number().min(1, "Initial investment must be greater than 0"),
  monthlyWithdrawal: z.coerce.number().min(1, "Monthly withdrawal must be greater than 0"),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  withdrawalPeriodYears: z.coerce.number().int().min(1, "Withdrawal period must be at least 1 year").max(50),
}).refine(data => data.initialInvestment > 0 && (data.initialInvestment * (data.expectedReturnRate / 100 / 12)) >= data.monthlyWithdrawal || (data.expectedReturnRate / 100 / 12) * data.initialInvestment < data.monthlyWithdrawal, {
  // This validation logic is complex and might need adjustment for edge cases.
  // Basic idea: if returns don't cover withdrawal, corpus will deplete. If they do, it might grow.
  // For now, allow if withdrawal is higher than initial period's return, as corpus will deplete.
  // A more robust check for immediate depletion might be needed if withdrawal > initialInvestment / (months) in some cases without growth
  message: "Monthly withdrawal might be too high for sustained growth or corpus preservation depending on returns. Calculation will proceed.",
  path: ["monthlyWithdrawal"], // Path can be adjusted
});


type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  totalWithdrawn: number;
  finalBalance: number;
  message?: string;
}

export function SwpCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 1000000, monthlyWithdrawal: 5000, expectedReturnRate: 7, withdrawalPeriodYears: 20 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.initialInvestment;
    const W = data.monthlyWithdrawal;
    const annualRate = data.expectedReturnRate / 100;
    const i = annualRate / 12; // Monthly interest rate
    const n = data.withdrawalPeriodYears * 12; // Number of months for withdrawal

    let finalBalance;
    let message = "";

    if (i === 0) { // If interest rate is 0
      finalBalance = P - (W * n);
    } else {
      // Future Value of Initial Investment - Future Value of Withdrawals (ordinary annuity)
      finalBalance = P * Math.pow(1 + i, n) - W * ((Math.pow(1 + i, n) - 1) / i);
    }
    
    const totalWithdrawn = W * n;

    if (finalBalance < 0) {
        // Calculate when corpus depletes if finalBalance is negative
        // NPER formula: N = -ln(1 - (PV*i)/PMT) / ln(1+i) if FV is 0
        // Here PV is P, PMT is W, i is monthly rate.
        let monthsToDepletion = 0;
        if (W > P * i) { // Only if withdrawal is greater than earnings
            if (i > 0) {
                 monthsToDepletion = Math.log(W / (W - P * i)) / Math.log(1 + i);
            } else { // if i is 0, depletion is P/W
                 monthsToDepletion = P / W;
            }
            const years = Math.floor(monthsToDepletion / 12);
            const remainingMonths = Math.round(monthsToDepletion % 12);
            message = `The corpus is projected to deplete in approximately ${years} years and ${remainingMonths} months.`;
        } else if ( P*i >= W && i > 0) { // If initial earnings cover withdrawals but still depletes (e.g. error in FV formula or very long period)
             message = `The corpus is projected to deplete. Please check parameters.`; // Should not happen if FV formula is correct
        } else {
             message = `The corpus is projected to deplete.`;
        }
        finalBalance = 0; // Corpus is depleted
    }


    setResult({
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        finalBalance: parseFloat(finalBalance.toFixed(2)),
        message: message || undefined,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">SWP (Systematic Withdrawal Plan) Calculator</CardTitle>
        <CardDescription>Plan your systematic withdrawals from investments.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
          </div>
          <div>
            <Label htmlFor="monthlyWithdrawal">Desired Monthly Withdrawal ({currency.symbol})</Label>
            <Input id="monthlyWithdrawal" type="number" step="any" {...form.register('monthlyWithdrawal')} />
            {form.formState.errors.monthlyWithdrawal && <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyWithdrawal.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input id="expectedReturnRate" type="number" step="any" {...form.register('expectedReturnRate')} />
              {form.formState.errors.expectedReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRate.message}</p>}
            </div>
            <div>
              <Label htmlFor="withdrawalPeriodYears">Withdrawal Period (Years)</Label>
              <Input id="withdrawalPeriodYears" type="number" {...form.register('withdrawalPeriodYears')} />
              {form.formState.errors.withdrawalPeriodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.withdrawalPeriodYears.message}</p>}
            </div>
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
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Total Amount Withdrawn over {form.getValues("withdrawalPeriodYears")} years:</strong> {currency.symbol}{result.totalWithdrawn.toLocaleString()}</p>
          <p><strong>Estimated Final Balance after {form.getValues("withdrawalPeriodYears")} years:</strong> {currency.symbol}{result.finalBalance.toLocaleString()}</p>
          {result.message && <p className="text-sm text-destructive mt-2">{result.message}</p>}
          <p className="text-xs mt-2 text-muted-foreground">Note: This calculation assumes returns are compounded monthly and withdrawals occur at the end of each month. Market conditions can vary.</p>
        </div>
      )}
    </Card>
  );
}
