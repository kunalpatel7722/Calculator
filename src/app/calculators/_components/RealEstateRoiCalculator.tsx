
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
  purchasePrice: z.coerce.number().min(1, "Purchase price must be greater than 0"),
  salePrice: z.coerce.number().min(0, "Sale price must be non-negative"),
  totalExpenses: z.coerce.number().min(0, "Total expenses must be non-negative (renovations, fees, etc.)"),
  rentalIncome: z.coerce.number().min(0, "Total rental income must be non-negative (if applicable)").optional(),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  netProfit: number;
  roiPercentage: number;
  initialInvestment: number;
}

export function RealEstateRoiCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { purchasePrice: 200000, salePrice: 250000, totalExpenses: 10000, rentalIncome: 12000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const initialInvestment = data.purchasePrice + data.totalExpenses;
    const totalRevenue = data.salePrice + (data.rentalIncome || 0);
    const netProfit = totalRevenue - initialInvestment;
    const roiPercentage = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
    
    setResult({ 
        netProfit: parseFloat(netProfit.toFixed(2)),
        roiPercentage: parseFloat(roiPercentage.toFixed(2)),
        initialInvestment: parseFloat(initialInvestment.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Real Estate ROI Calculator</CardTitle>
        <CardDescription>Calculate the Return on Investment for your real estate properties.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price ({currency.symbol})</Label>
              <Input id="purchasePrice" type="number" step="any" {...form.register('purchasePrice')} />
              {form.formState.errors.purchasePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.purchasePrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price ({currency.symbol})</Label>
              <Input id="salePrice" type="number" step="any" {...form.register('salePrice')} />
              {form.formState.errors.salePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.salePrice.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <Label htmlFor="totalExpenses">Total Expenses ({currency.symbol}) (Renovations, Fees, etc.)</Label>
              <Input id="totalExpenses" type="number" step="any" {...form.register('totalExpenses')} />
              {form.formState.errors.totalExpenses && <p className="text-sm text-destructive mt-1">{form.formState.errors.totalExpenses.message}</p>}
            </div>
            <div>
              <Label htmlFor="rentalIncome">Total Rental Income (Optional) ({currency.symbol})</Label>
              <Input id="rentalIncome" type="number" step="any" {...form.register('rentalIncome')} />
              {form.formState.errors.rentalIncome && <p className="text-sm text-destructive mt-1">{form.formState.errors.rentalIncome.message}</p>}
            </div>
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
          <Button type="submit" className="w-full md:w-auto">Calculate ROI</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Initial Investment (Purchase + Expenses):</strong> {currency.symbol}{result.initialInvestment.toLocaleString()}</p>
          <p><strong>Net Profit:</strong> {currency.symbol}{result.netProfit.toLocaleString()}</p>
          <p><strong>ROI Percentage:</strong> {result.roiPercentage.toLocaleString()}%</p>
        </div>
      )}
    </Card>
  );
}
