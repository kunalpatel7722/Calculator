
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  initialInvestment: z.coerce.number().min(0.01, "Initial investment must be greater than 0"),
  currentValue: z.coerce.number().min(0, "Current value must be non-negative"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  initialInvestment: number;
  currentValue: number;
  roiPercentage: number;
  profitLoss: number;
}

export function BitcoinRoiCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 1000, currentValue: 1500 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const profitLoss = data.currentValue - data.initialInvestment;
    const roiPercentage = data.initialInvestment !== 0 ? (profitLoss / data.initialInvestment) * 100 : 0;
    setResult({ 
      initialInvestment: data.initialInvestment,
      currentValue: data.currentValue,
      roiPercentage: parseFloat(roiPercentage.toFixed(2)),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Bitcoin ROI Calculator</CardTitle>
        <CardDescription>Calculate your Return on Investment for Bitcoin or other crypto assets.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
          </div>
          <div>
            <Label htmlFor="currentValue">Current Value ({currency.symbol})</Label>
            <Input id="currentValue" type="number" step="any" {...form.register('currentValue')} />
            {form.formState.errors.currentValue && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentValue.message}</p>}
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
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Initial Investment</TableCell>
                <TableCell className="text-right">{currency.symbol}{result.initialInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Current Value</TableCell>
                <TableCell className="text-right">{currency.symbol}{result.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Profit/Loss</TableCell>
                <TableCell className={`text-right font-semibold ${result.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>{currency.symbol}{result.profitLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ROI Percentage</TableCell>
                <TableCell className={`text-right font-semibold ${result.roiPercentage >= 0 ? 'text-green-600' : 'text-destructive'}`}>{result.roiPercentage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
