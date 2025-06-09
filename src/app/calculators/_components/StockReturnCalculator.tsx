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
  purchasePrice: z.coerce.number().min(0, "Purchase price must be non-negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be non-negative"),
  shares: z.coerce.number().min(1, "Number of shares must be at least 1"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  totalInvestment: number;
  totalReturnValue: number;
  profitLoss: number;
  returnPercentage: number;
}

export function StockReturnCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { purchasePrice: 100, sellingPrice: 120, shares: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const totalInvestment = data.purchasePrice * data.shares;
    const totalReturnValue = data.sellingPrice * data.shares;
    const profitLoss = totalReturnValue - totalInvestment;
    const returnPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;
    setResult({ 
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalReturnValue: parseFloat(totalReturnValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Stock Return Calculator</CardTitle>
        <CardDescription>Calculate profit or loss from your stock investments.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price per Share ({currency.symbol})</Label>
              <Input id="purchasePrice" type="number" step="any" {...form.register('purchasePrice')} />
              {form.formState.errors.purchasePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.purchasePrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price per Share ({currency.symbol})</Label>
              <Input id="sellingPrice" type="number" step="any" {...form.register('sellingPrice')} />
              {form.formState.errors.sellingPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.sellingPrice.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="shares">Number of Shares</Label>
            <Input id="shares" type="number" {...form.register('shares')} />
            {form.formState.errors.shares && <p className="text-sm text-destructive mt-1">{form.formState.errors.shares.message}</p>}
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
          <div className="space-y-2">
            <p><strong>Total Investment:</strong> {currency.symbol}{result.totalInvestment.toLocaleString()}</p>
            <p><strong>Total Return Value:</strong> {currency.symbol}{result.totalReturnValue.toLocaleString()}</p>
            <p><strong>Profit/Loss:</strong> {currency.symbol}{result.profitLoss.toLocaleString()}</p>
            <p><strong>Return Percentage:</strong> {result.returnPercentage.toLocaleString()}%</p>
          </div>
        </div>
      )}
    </Card>
  );
}
