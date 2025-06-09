
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
  monthlyInvestment: z.coerce.number().min(1, "Monthly investment must be greater than 0"),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  investmentPeriodYears: z.coerce.number().min(1, "Investment period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
}

export function SipCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { monthlyInvestment: 5000, expectedReturnRate: 12, investmentPeriodYears: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.monthlyInvestment;
    const annualRate = data.expectedReturnRate / 100;
    const i = annualRate / 12; // monthly interest rate
    const n = data.investmentPeriodYears * 12; // number of months

    const futureValue = P * ( (Math.pow(1 + i, n) - 1) / i ) * (1 + i);
    const totalInvested = P * n;
    const estimatedReturns = futureValue - totalInvested;
    
    setResult({ 
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        estimatedReturns: parseFloat(estimatedReturns.toFixed(2)),
        futureValue: parseFloat(futureValue.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">SIP (Systematic Investment Plan) Calculator</CardTitle>
        <CardDescription>Project the future value of your SIP investments.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="monthlyInvestment">Monthly Investment ({currency.symbol})</Label>
            <Input id="monthlyInvestment" type="number" step="any" {...form.register('monthlyInvestment')} />
            {form.formState.errors.monthlyInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyInvestment.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input id="expectedReturnRate" type="number" step="any" {...form.register('expectedReturnRate')} />
              {form.formState.errors.expectedReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRate.message}</p>}
            </div>
            <div>
              <Label htmlFor="investmentPeriodYears">Investment Period (Years)</Label>
              <Input id="investmentPeriodYears" type="number" {...form.register('investmentPeriodYears')} />
              {form.formState.errors.investmentPeriodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentPeriodYears.message}</p>}
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
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Total Amount Invested:</strong> {currency.symbol}{result.totalInvested.toLocaleString()}</p>
          <p><strong>Estimated Returns:</strong> {currency.symbol}{result.estimatedReturns.toLocaleString()}</p>
          <p><strong>Estimated Future Value:</strong> {currency.symbol}{result.futureValue.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
