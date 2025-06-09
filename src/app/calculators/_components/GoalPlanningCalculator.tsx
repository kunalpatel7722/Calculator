
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
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  yearsToGoal: z.coerce.number().min(1, "Years to goal must be at least 1").max(100),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  initialInvestment: z.coerce.number().min(0, "Initial investment must be non-negative").optional(),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  requiredMonthlyInvestment: number; // Placeholder
}

export function GoalPlanningCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { targetAmount: 50000, yearsToGoal: 5, expectedReturnRate: 7, initialInvestment: 1000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Placeholder: Real goal planning calculation (PMT formula) is complex.
    const r = data.expectedReturnRate / 100 / 12; // Monthly rate
    const n = data.yearsToGoal * 12; // Number of months
    const FV = data.targetAmount;
    const PV = data.initialInvestment || 0;

    let pmt;
    if (r === 0) { // If rate is 0
        pmt = (FV - PV) / n;
    } else {
        pmt = (FV - PV * Math.pow(1 + r, n)) / ( (Math.pow(1 + r, n) - 1) / r );
    }
    
    setResult({ requiredMonthlyInvestment: parseFloat(pmt.toFixed(2)) });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Financial Goal Planning Calculator</CardTitle>
        <CardDescription>Plan investments to reach your financial goals. (Calculates monthly investment)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="targetAmount">Target Amount ({currency.symbol})</Label>
            <Input id="targetAmount" type="number" step="any" {...form.register('targetAmount')} />
            {form.formState.errors.targetAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.targetAmount.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="yearsToGoal">Years to Reach Goal</Label>
              <Input id="yearsToGoal" type="number" {...form.register('yearsToGoal')} />
              {form.formState.errors.yearsToGoal && <p className="text-sm text-destructive mt-1">{form.formState.errors.yearsToGoal.message}</p>}
            </div>
            <div>
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input id="expectedReturnRate" type="number" step="any" {...form.register('expectedReturnRate')} />
              {form.formState.errors.expectedReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRate.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="initialInvestment">Initial Investment (Optional) ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
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
          <p><strong>Required Monthly Investment:</strong> {currency.symbol}{result.requiredMonthlyInvestment.toLocaleString()}</p>
           <p className="text-xs mt-2 text-muted-foreground">Note: Assumes consistent monthly investments and returns compounded monthly. This is a simplified calculation.</p>
        </div>
      )}
    </Card>
  );
}
