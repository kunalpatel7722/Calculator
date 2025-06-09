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
  investmentAmount: z.coerce.number().min(0.01, "Investment amount must be greater than 0"),
  tokensReceived: z.coerce.number().min(0.000001, "Tokens received must be positive"),
  currentTokenPrice: z.coerce.number().min(0, "Current token price must be non-negative"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  currentValue: number;
  profitLoss: number;
  roiPercentage: number;
}

export function IcoIdoRoiCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { investmentAmount: 100, tokensReceived: 1000, currentTokenPrice: 0.5 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const currentValue = data.tokensReceived * data.currentTokenPrice;
    const profitLoss = currentValue - data.investmentAmount;
    const roiPercentage = data.investmentAmount > 0 ? (profitLoss / data.investmentAmount) * 100 : 0;
    setResult({ 
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        roiPercentage: parseFloat(roiPercentage.toFixed(2))
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">ICO/IDO ROI Calculator</CardTitle>
        <CardDescription>Calculate ROI for your Initial Coin Offering (ICO) or Initial DEX Offering (IDO) investments.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="investmentAmount">Total Investment Amount ({currency.symbol})</Label>
            <Input id="investmentAmount" type="number" step="any" {...form.register('investmentAmount')} />
            {form.formState.errors.investmentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentAmount.message}</p>}
          </div>
          <div>
            <Label htmlFor="tokensReceived">Number of Tokens Received</Label>
            <Input id="tokensReceived" type="number" step="any" {...form.register('tokensReceived')} />
            {form.formState.errors.tokensReceived && <p className="text-sm text-destructive mt-1">{form.formState.errors.tokensReceived.message}</p>}
          </div>
           <div>
            <Label htmlFor="currentTokenPrice">Current Price per Token ({currency.symbol})</Label>
            <Input id="currentTokenPrice" type="number" step="any" {...form.register('currentTokenPrice')} />
            {form.formState.errors.currentTokenPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentTokenPrice.message}</p>}
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
          <p><strong>Current Value of Tokens:</strong> {currency.symbol}{result.currentValue.toLocaleString()}</p>
          <p><strong>Profit/Loss:</strong> {currency.symbol}{result.profitLoss.toLocaleString()}</p>
          <p><strong>ROI Percentage:</strong> {result.roiPercentage.toLocaleString()}%</p>
        </div>
      )}
    </Card>
  );
}
