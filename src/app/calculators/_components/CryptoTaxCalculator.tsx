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
  totalGains: z.coerce.number().min(0, "Total gains must be non-negative"),
  taxRate: z.coerce.number().min(0, "Tax rate must be non-negative").max(100, "Tax rate cannot exceed 100%"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  estimatedTax: number;
}

export function CryptoTaxCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { totalGains: 5000, taxRate: 20 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const estimatedTax = (data.totalGains * data.taxRate) / 100;
    setResult({ estimatedTax: parseFloat(estimatedTax.toFixed(2)) });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Crypto Tax Calculator</CardTitle>
        <CardDescription>Estimate potential taxes on your crypto gains. (For informational purposes only, consult a tax professional)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="totalGains">Total Crypto Gains ({currency.symbol})</Label>
            <Input id="totalGains" type="number" step="any" {...form.register('totalGains')} />
            {form.formState.errors.totalGains && <p className="text-sm text-destructive mt-1">{form.formState.errors.totalGains.message}</p>}
          </div>
          <div>
            <Label htmlFor="taxRate">Applicable Tax Rate (%)</Label>
            <Input id="taxRate" type="number" step="any" {...form.register('taxRate')} />
            {form.formState.errors.taxRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.taxRate.message}</p>}
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
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Estimate)</h3>
          <p><strong>Estimated Tax Liability:</strong> {currency.symbol}{result.estimatedTax.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
