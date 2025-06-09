
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyToggle, AVAILABLE_CURRENCIES, type Currency } from '@/components/shared/CurrencyToggle';

const formSchema = z.object({
  value: z.coerce.number(), // Can be PV or FV depending on calculationType
  rate: z.coerce.number().min(0, "Rate must be non-negative").max(100),
  periods: z.coerce.number().min(1, "Periods must be at least 1").max(1000),
  calculationType: z.enum(['FV', 'PV']), // Future Value or Present Value
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  calculatedValue: number;
  label: string;
}

export function TimeValueOfMoneyCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: 1000, rate: 5, periods: 10, calculationType: 'FV' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const r = data.rate / 100;
    let calculatedValue;
    let label;

    if (data.calculationType === 'FV') {
      calculatedValue = data.value * Math.pow(1 + r, data.periods);
      label = "Future Value (FV)";
    } else { // PV
      calculatedValue = data.value / Math.pow(1 + r, data.periods);
      label = "Present Value (PV)";
    }
    
    setResult({ calculatedValue: parseFloat(calculatedValue.toFixed(2)), label });
  };

  const valueLabel = form.watch('calculationType') === 'FV' ? `Present Value (PV) (${currency.symbol})` : `Future Value (FV) (${currency.symbol})`;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Time Value of Money (TVM) Calculator</CardTitle>
        <CardDescription>Calculate Present Value (PV) or Future Value (FV).</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="calculationType">Calculate</Label>
             <Select onValueChange={(value) => form.setValue('calculationType', value as FormData['calculationType'])} defaultValue={form.getValues('calculationType')}>
                <SelectTrigger id="calculationType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FV">Future Value (FV)</SelectItem>
                  <SelectItem value="PV">Present Value (PV)</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div>
            <Label htmlFor="value">{valueLabel}</Label>
            <Input id="value" type="number" step="any" {...form.register('value')} />
            {form.formState.errors.value && <p className="text-sm text-destructive mt-1">{form.formState.errors.value.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="rate">Interest Rate per Period (%)</Label>
              <Input id="rate" type="number" step="any" {...form.register('rate')} />
              {form.formState.errors.rate && <p className="text-sm text-destructive mt-1">{form.formState.errors.rate.message}</p>}
            </div>
            <div>
              <Label htmlFor="periods">Number of Periods</Label>
              <Input id="periods" type="number" {...form.register('periods')} />
              {form.formState.errors.periods && <p className="text-sm text-destructive mt-1">{form.formState.errors.periods.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Result</h3>
          <p><strong>{result.label}:</strong> {currency.symbol}{result.calculatedValue.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
