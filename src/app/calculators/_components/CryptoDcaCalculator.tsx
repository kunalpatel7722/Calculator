
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
  investmentAmount: z.coerce.number().min(1, "Investment amount per period must be at least 1"),
  numberOfPeriods: z.coerce.number().int().min(1, "Number of periods must be at least 1"),
  averagePrice: z.coerce.number().min(0.01, "Estimated average price must be greater than 0"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  totalInvested: number;
  totalCryptoAcquired: number; // Placeholder
  averageCostPerUnit: number; // Placeholder
}

export function CryptoDcaCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { investmentAmount: 100, numberOfPeriods: 12, averagePrice: 30000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Simplified DCA calculation for UI demonstration
    const totalInvested = data.investmentAmount * data.numberOfPeriods;
    const totalCryptoAcquired = totalInvested / data.averagePrice; // Highly simplified
    const averageCostPerUnit = data.averagePrice; // Simplified

    setResult({ 
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCryptoAcquired: parseFloat(totalCryptoAcquired.toFixed(6)),
        averageCostPerUnit: parseFloat(averageCostPerUnit.toFixed(2))
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Crypto DCA Calculator</CardTitle>
        <CardDescription>Simulate Dollar Cost Averaging for crypto investments. (Simplified)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="investmentAmount">Investment Amount per Period ({currency.symbol})</Label>
            <Input id="investmentAmount" type="number" step="any" {...form.register('investmentAmount')} />
            {form.formState.errors.investmentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentAmount.message}</p>}
          </div>
          <div>
            <Label htmlFor="numberOfPeriods">Number of Investment Periods</Label>
            <Input id="numberOfPeriods" type="number" {...form.register('numberOfPeriods')} />
            {form.formState.errors.numberOfPeriods && <p className="text-sm text-destructive mt-1">{form.formState.errors.numberOfPeriods.message}</p>}
          </div>
          <div>
            <Label htmlFor="averagePrice">Estimated Average Crypto Price ({currency.symbol})</Label>
            <Input id="averagePrice" type="number" step="any" {...form.register('averagePrice')} />
            {form.formState.errors.averagePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.averagePrice.message}</p>}
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
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Simplified)</h3>
          <p><strong>Total Amount Invested:</strong> {currency.symbol}{result.totalInvested.toLocaleString()}</p>
          <p><strong>Estimated Total Crypto Acquired:</strong> {result.totalCryptoAcquired.toLocaleString()} units</p>
          <p><strong>Estimated Average Cost per Unit:</strong> {currency.symbol}{result.averageCostPerUnit.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
