
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
  withdrawalPeriodYears: z.coerce.number().min(1, "Withdrawal period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  totalWithdrawn: number;
  finalBalance: number; // Placeholder
  yearsToDepletion?: number; // Placeholder
}

export function SwpCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 1000000, monthlyWithdrawal: 5000, expectedReturnRate: 7, withdrawalPeriodYears: 20 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Placeholder: Real SWP calculation involves iterative balance reduction.
    const totalWithdrawn = data.monthlyWithdrawal * data.withdrawalPeriodYears * 12;
    // Simplified: Does not account for investment growth/depletion accurately.
    const finalBalance = data.initialInvestment + (data.initialInvestment * (data.expectedReturnRate/100) * data.withdrawalPeriodYears) - totalWithdrawn; 

    setResult({ 
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        finalBalance: parseFloat(finalBalance.toFixed(2)), // This is a very rough estimate
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">SWP (Systematic Withdrawal Plan) Calculator</CardTitle>
        <CardDescription>Plan your systematic withdrawals from investments. (Simplified)</CardDescription>
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
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Simplified Estimate)</h3>
          <p><strong>Total Amount Withdrawn:</strong> {currency.symbol}{result.totalWithdrawn.toLocaleString()}</p>
          <p><strong>Estimated Final Balance after {form.getValues("withdrawalPeriodYears")} years:</strong> {currency.symbol}{result.finalBalance.toLocaleString()}</p>
          <p className="text-xs mt-2 text-muted-foreground">Note: This is a simplified calculation. Actual final balance will vary based on market performance and precise withdrawal timing.</p>
        </div>
      )}
    </Card>
  );
}
