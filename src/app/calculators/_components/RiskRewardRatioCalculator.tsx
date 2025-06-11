
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
  potentialProfit: z.coerce.number().min(0.01, "Potential profit must be greater than 0"),
  potentialLoss: z.coerce.number().min(0.01, "Potential loss must be greater than 0"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  riskRewardRatio: string; // Display as "1 : X"
}

export function RiskRewardRatioCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { potentialProfit: 30, potentialLoss: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const ratio = data.potentialProfit / data.potentialLoss;
    setResult({ riskRewardRatio: `1 : ${ratio.toFixed(2)}` });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Risk/Reward Ratio Calculator</CardTitle>
        <CardDescription>Assess the risk vs. potential reward of an investment or trade.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="potentialProfit">Potential Profit ({currency.symbol})</Label>
            <Input id="potentialProfit" type="number" step="any" {...form.register('potentialProfit')} />
            {form.formState.errors.potentialProfit && <p className="text-sm text-destructive mt-1">{form.formState.errors.potentialProfit.message}</p>}
          </div>
          <div>
            <Label htmlFor="potentialLoss">Potential Loss (Risk) ({currency.symbol})</Label>
            <Input id="potentialLoss" type="number" step="any" {...form.register('potentialLoss')} />
            {form.formState.errors.potentialLoss && <p className="text-sm text-destructive mt-1">{form.formState.errors.potentialLoss.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Currency for Input Fields</Label>
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
          <p><strong>Risk/Reward Ratio:</strong> {result.riskRewardRatio}</p>
        </div>
      )}
    </Card>
  );
}
