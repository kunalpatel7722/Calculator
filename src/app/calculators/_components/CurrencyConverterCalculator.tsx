
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AVAILABLE_CURRENCIES, type Currency } from '@/components/shared/CurrencyToggle'; // Reusing currency definitions

const formSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be non-negative"),
  fromCurrencyValue: z.string().min(1, "Please select a source currency"),
  toCurrencyValue: z.string().min(1, "Please select a target currency"),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rateUsed: number | null;
}

// Static placeholder rates. In a real app, these would come from an API.
const PLACEHOLDER_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.93, GBP: 0.79, INR: 83.50, JPY: 157.00, AUD: 1.50, CAD: 1.37, CHF: 0.90, CNY: 7.25, USD: 1.00 },
  EUR: { USD: 1.08, GBP: 0.85, INR: 90.20, JPY: 169.50, AUD: 1.62, CAD: 1.48, CHF: 0.97, CNY: 7.83, EUR: 1.00 },
  GBP: { USD: 1.27, EUR: 1.18, INR: 106.00, JPY: 199.80, AUD: 1.91, CAD: 1.74, CHF: 1.14, CNY: 9.21, GBP: 1.00 },
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.88, AUD: 0.018, CAD: 0.016, CHF: 0.0108, CNY: 0.087, INR: 1.00 },
  JPY: { USD: 0.0064, EUR: 0.0059, GBP: 0.0050, INR: 0.53, AUD: 0.0096, CAD: 0.0087, CHF: 0.0057, CNY: 0.046, JPY: 1.00 },
  AUD: { USD: 0.66, EUR: 0.62, GBP: 0.52, INR: 55.40, JPY: 104.10, CAD: 0.91, CHF: 0.60, CNY: 4.81, AUD: 1.00 },
  CAD: { USD: 0.73, EUR: 0.68, GBP: 0.57, INR: 60.80, JPY: 114.40, AUD: 1.10, CHF: 0.66, CNY: 5.29, CAD: 1.00 },
  CHF: { USD: 1.11, EUR: 1.03, GBP: 0.88, INR: 92.80, JPY: 174.80, AUD: 1.67, CAD: 1.51, CNY: 8.08, CHF: 1.00 },
  CNY: { USD: 0.138, EUR: 0.128, GBP: 0.109, INR: 11.50, JPY: 21.65, AUD: 0.208, CAD: 0.189, CHF: 0.124, CNY: 1.00 },
};

export function CurrencyConverterCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 100, fromCurrencyValue: 'USD', toCurrencyValue: 'EUR' },
  });

  const watchedFromCurrencyValue = form.watch('fromCurrencyValue');
  const [currentFromSymbol, setCurrentFromSymbol] = useState('$');

  useEffect(() => {
    const currencyObj = AVAILABLE_CURRENCIES.find(c => c.value === watchedFromCurrencyValue);
    setCurrentFromSymbol(currencyObj?.symbol || '$');
  }, [watchedFromCurrencyValue]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const fromCurrency = AVAILABLE_CURRENCIES.find(c => c.value === data.fromCurrencyValue);
    const toCurrency = AVAILABLE_CURRENCIES.find(c => c.value === data.toCurrencyValue);

    if (!fromCurrency || !toCurrency) {
      // Should not happen if form validation is correct
      console.error("Selected currency not found");
      setResult(null);
      return;
    }

    let convertedAmount;
    let rateUsed = null;

    if (data.fromCurrencyValue === data.toCurrencyValue) {
      convertedAmount = data.amount;
      rateUsed = 1.0;
    } else {
      rateUsed = PLACEHOLDER_RATES[data.fromCurrencyValue]?.[data.toCurrencyValue] || null;
      if (rateUsed !== null) {
        convertedAmount = data.amount * rateUsed;
      } else {
        // Handle case where rate is not available (e.g., show an error or a message)
        console.warn(`Placeholder rate for ${data.fromCurrencyValue} to ${data.toCurrencyValue} not found.`);
        form.setError("root.serverError", { type: "manual", message: `Conversion rate from ${fromCurrency.label} to ${toCurrency.label} is not available with placeholder data.` });
        setResult(null);
        return;
      }
    }
    
    setResult({ 
      originalAmount: data.amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)), // Typically to 2 decimal places for currency
      fromCurrency,
      toCurrency,
      rateUsed
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Currency Converter</CardTitle>
        <CardDescription>Convert amounts between different currencies. Uses placeholder exchange rates.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="amount">Amount ({currentFromSymbol})</Label>
            <Input id="amount" type="number" step="any" {...form.register('amount')} />
            {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fromCurrencyValue">From Currency</Label>
              <Select onValueChange={(value) => form.setValue('fromCurrencyValue', value)} defaultValue={form.getValues('fromCurrencyValue')}>
                <SelectTrigger id="fromCurrencyValue"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CURRENCIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.fromCurrencyValue && <p className="text-sm text-destructive mt-1">{form.formState.errors.fromCurrencyValue.message}</p>}
            </div>

            <div>
              <Label htmlFor="toCurrencyValue">To Currency</Label>
              <Select onValueChange={(value) => form.setValue('toCurrencyValue', value)} defaultValue={form.getValues('toCurrencyValue')}>
                <SelectTrigger id="toCurrencyValue"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CURRENCIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.toCurrencyValue && <p className="text-sm text-destructive mt-1">{form.formState.errors.toCurrencyValue.message}</p>}
            </div>
          </div>
           {form.formState.errors.root?.serverError && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.root.serverError.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Convert</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Conversion Result</h3>
          <p className="text-lg">
            {result.fromCurrency.symbol}{result.originalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({result.fromCurrency.value})
            <span className="mx-2">is approximately</span>
            <strong className="text-primary">
              {result.toCurrency.symbol}{result.convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({result.toCurrency.value})
            </strong>
          </p>
          {result.rateUsed !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              (Using placeholder exchange rate: 1 {result.fromCurrency.value} = {result.rateUsed.toFixed(4)} {result.toCurrency.value})
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Disclaimer:</strong> This calculator uses static, placeholder exchange rates for demonstration purposes only. It does not reflect real-time market values.
          </p>
        </div>
      )}
    </Card>
  );
}
