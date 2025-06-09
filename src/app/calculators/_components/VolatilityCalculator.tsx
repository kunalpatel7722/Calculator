
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyToggle, AVAILABLE_CURRENCIES, type Currency } from '@/components/shared/CurrencyToggle';

const formSchema = z.object({
  historicalPrices: z.string().min(1, "Please enter historical prices"), // Comma-separated numbers
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  volatility: number; // Placeholder, actual calculation is complex
  priceCount: number;
  averagePrice: number;
}

export function VolatilityCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { historicalPrices: "100,102,98,105,103" },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const prices = data.historicalPrices.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    if (prices.length < 2) {
        form.setError("historicalPrices", { type: "manual", message: "Please enter at least two valid prices."});
        setResult(null);
        return;
    }
    // Placeholder: Real volatility (e.g., standard deviation of returns) is more complex.
    // This is a simplified version for UI demonstration.
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);

    setResult({ 
        volatility: parseFloat(standardDeviation.toFixed(2)), // Simplified: using standard deviation of prices
        priceCount: prices.length,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Volatility Calculator</CardTitle>
        <CardDescription>Measure the volatility of an investment based on historical prices. (Simplified)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="historicalPrices">Historical Prices ({currency.symbol}) (comma-separated)</Label>
            <Textarea id="historicalPrices" {...form.register('historicalPrices')} placeholder="e.g., 100,102,98,105,103" />
            {form.formState.errors.historicalPrices && <p className="text-sm text-destructive mt-1">{form.formState.errors.historicalPrices.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Currency (for display context)</Label>
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
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Simplified)</h3>
          <p><strong>Calculated Volatility (Std. Dev. of Prices):</strong> {currency.symbol}{result.volatility.toLocaleString()}</p>
          <p><strong>Number of Prices Analyzed:</strong> {result.priceCount}</p>
          <p><strong>Average Price:</strong> {currency.symbol}{result.averagePrice.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
