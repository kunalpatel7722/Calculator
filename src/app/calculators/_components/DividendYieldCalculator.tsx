
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
  annualDividendPerShare: z.coerce.number().min(0, "Annual dividend must be non-negative"),
  currentMarketPrice: z.coerce.number().min(0.01, "Market price must be greater than 0"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  dividendYield: number;
}

export function DividendYieldCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { annualDividendPerShare: 5, currentMarketPrice: 100 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const dividendYield = (data.annualDividendPerShare / data.currentMarketPrice) * 100;
    setResult({ dividendYield: parseFloat(dividendYield.toFixed(2)) });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Dividend Yield Calculator</CardTitle>
        <CardDescription>Determine the dividend yield of a stock.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="annualDividendPerShare">Annual Dividend per Share ({currency.symbol})</Label>
            <Input id="annualDividendPerShare" type="number" step="any" {...form.register('annualDividendPerShare')} />
            {form.formState.errors.annualDividendPerShare && <p className="text-sm text-destructive mt-1">{form.formState.errors.annualDividendPerShare.message}</p>}
          </div>
          <div>
            <Label htmlFor="currentMarketPrice">Current Market Price per Share ({currency.symbol})</Label>
            <Input id="currentMarketPrice" type="number" step="any" {...form.register('currentMarketPrice')} />
            {form.formState.errors.currentMarketPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentMarketPrice.message}</p>}
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
          <p><strong>Dividend Yield:</strong> {result.dividendYield.toLocaleString()}%</p>
        </div>
      )}
    </Card>
  );
}
