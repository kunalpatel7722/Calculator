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
  portfolioValue: z.coerce.number().min(1, "Portfolio value must be greater than 0"),
  potentialDrawdown: z.coerce.number().min(1, "Potential drawdown must be at least 1%").max(100, "Drawdown cannot exceed 100%"),
  recoveryRate: z.coerce.number().min(0.1, "Recovery rate must be positive").max(100, "Recovery rate unrealistic if too high").optional(),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  valueAfterDrawdown: number;
  percentageNeededToRecover: number;
  // yearsToRecover?: number; // Placeholder for more complex calculation
}

export function BearMarketSurvivalCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { portfolioValue: 100000, potentialDrawdown: 30, recoveryRate: 7 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const drawdownDecimal = data.potentialDrawdown / 100;
    const valueAfterDrawdown = data.portfolioValue * (1 - drawdownDecimal);
    const percentageNeededToRecover = (data.portfolioValue / valueAfterDrawdown - 1) * 100;
    
    setResult({ 
        valueAfterDrawdown: parseFloat(valueAfterDrawdown.toFixed(2)),
        percentageNeededToRecover: parseFloat(percentageNeededToRecover.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Bear Market Survival Calculator</CardTitle>
        <CardDescription>Assess portfolio resilience and recovery in bear markets.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="portfolioValue">Current Portfolio Value ({currency.symbol})</Label>
            <Input id="portfolioValue" type="number" step="any" {...form.register('portfolioValue')} />
            {form.formState.errors.portfolioValue && <p className="text-sm text-destructive mt-1">{form.formState.errors.portfolioValue.message}</p>}
          </div>
          <div>
            <Label htmlFor="potentialDrawdown">Potential Market Drawdown (%)</Label>
            <Input id="potentialDrawdown" type="number" step="any" {...form.register('potentialDrawdown')} />
            {form.formState.errors.potentialDrawdown && <p className="text-sm text-destructive mt-1">{form.formState.errors.potentialDrawdown.message}</p>}
          </div>
          {/* 
          // Optional: Recovery Rate for time to recover - more complex
          <div>
            <Label htmlFor="recoveryRate">Assumed Annual Recovery Rate (%) (Optional)</Label>
            <Input id="recoveryRate" type="number" step="any" {...form.register('recoveryRate')} />
            {form.formState.errors.recoveryRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.recoveryRate.message}</p>}
          </div>
          */}
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
          <p><strong>Portfolio Value After {form.getValues("potentialDrawdown")}% Drawdown:</strong> {currency.symbol}{result.valueAfterDrawdown.toLocaleString()}</p>
          <p><strong>Percentage Gain Needed to Recover to Original Value:</strong> {result.percentageNeededToRecover.toLocaleString()}%</p>
        </div>
      )}
    </Card>
  );
}
