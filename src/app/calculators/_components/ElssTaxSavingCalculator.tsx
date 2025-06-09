
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
  investmentAmount: z.coerce.number().min(1, "Investment amount must be greater than 0").max(150000, "Max ELSS deduction under Sec 80C is 1,50,000"), // Max 80C limit
  taxSlabRate: z.coerce.number().min(0, "Tax slab rate must be non-negative").max(100),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  taxSaved: number;
}

export function ElssTaxSavingCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'INR') || AVAILABLE_CURRENCIES[0]); // Default to INR

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { investmentAmount: 150000, taxSlabRate: 30 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const effectiveInvestment = Math.min(data.investmentAmount, 150000); // Cap at 80C limit
    const taxSaved = (effectiveInvestment * data.taxSlabRate) / 100;
    setResult({ taxSaved: parseFloat(taxSaved.toFixed(2)) });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">ELSS Tax Saving Calculator</CardTitle>
        <CardDescription>Calculate potential tax savings with ELSS mutual funds under Section 80C.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="investmentAmount">Investment Amount in ELSS ({currency.symbol})</Label>
            <Input id="investmentAmount" type="number" step="any" {...form.register('investmentAmount')} />
            {form.formState.errors.investmentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentAmount.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">Maximum deduction under Section 80C is {currency.symbol}1,50,000.</p>
          </div>
          <div>
            <Label htmlFor="taxSlabRate">Your Income Tax Slab Rate (%)</Label>
            <Input id="taxSlabRate" type="number" step="any" {...form.register('taxSlabRate')} />
            {form.formState.errors.taxSlabRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.taxSlabRate.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate Tax Saved</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Estimated Tax Saved:</strong> {currency.symbol}{result.taxSaved.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
