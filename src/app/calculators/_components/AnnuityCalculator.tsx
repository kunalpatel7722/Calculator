
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
  principal: z.coerce.number().min(1, "Principal amount must be greater than 0"),
  interestRate: z.coerce.number().min(0, "Interest rate must be non-negative").max(100),
  years: z.coerce.number().int().min(1, "Number of years must be at least 1").max(50),
  paymentFrequency: z.enum(['monthly', 'quarterly', 'annually']),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  periodicPayment: number; // Placeholder
  totalPayments: number; // Placeholder
  totalInterest: number; // Placeholder
}

export function AnnuityCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { principal: 100000, interestRate: 5, years: 10, paymentFrequency: 'monthly' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Placeholder: Real annuity payment (PMT) calculation.
    const P = data.principal;
    const annualRate = data.interestRate / 100;
    let n = data.years; // Number of periods
    let r = annualRate; // Rate per period

    if (data.paymentFrequency === 'monthly') {
      n *= 12;
      r /= 12;
    } else if (data.paymentFrequency === 'quarterly') {
      n *= 4;
      r /= 4;
    }
    
    let pmt;
    if (r === 0) {
        pmt = P / n;
    } else {
        pmt = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    
    const totalPayments = pmt * n;
    const totalInterest = totalPayments - P;

    setResult({ 
        periodicPayment: parseFloat(pmt.toFixed(2)),
        totalPayments: parseFloat(totalPayments.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Annuity Calculator</CardTitle>
        <CardDescription>Calculate potential income from an annuity (ordinary annuity payments).</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="principal">Principal Amount (Annuity Value) ({currency.symbol})</Label>
            <Input id="principal" type="number" step="any" {...form.register('principal')} />
            {form.formState.errors.principal && <p className="text-sm text-destructive mt-1">{form.formState.errors.principal.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <Input id="interestRate" type="number" step="any" {...form.register('interestRate')} />
              {form.formState.errors.interestRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.interestRate.message}</p>}
            </div>
             <div>
              <Label htmlFor="years">Number of Years for Payout</Label>
              <Input id="years" type="number" {...form.register('years')} />
              {form.formState.errors.years && <p className="text-sm text-destructive mt-1">{form.formState.errors.years.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select onValueChange={(value) => form.setValue('paymentFrequency', value as FormData['paymentFrequency'])} defaultValue={form.getValues('paymentFrequency')}>
                <SelectTrigger id="paymentFrequency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
            </Select>
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
          <Button type="submit" className="w-full md:w-auto">Calculate Annuity Payment</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Periodic Payment ({form.getValues('paymentFrequency')}):</strong> {currency.symbol}{result.periodicPayment.toLocaleString()}</p>
          <p><strong>Total Payments Made:</strong> {currency.symbol}{result.totalPayments.toLocaleString()}</p>
          <p><strong>Total Interest Earned/Paid (depending on perspective):</strong> {currency.symbol}{result.totalInterest.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
