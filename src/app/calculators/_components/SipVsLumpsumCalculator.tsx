
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
  totalInvestment: z.coerce.number().min(1, "Total investment must be greater than 0"),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  investmentPeriodYears: z.coerce.number().min(1, "Investment period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  lumpsumFutureValue: number;
  sipFutureValue: number;
  totalInvested: number;
}

export function SipVsLumpsumCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { totalInvestment: 120000, expectedReturnRate: 12, investmentPeriodYears: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P_lumpsum = data.totalInvestment;
    const annualRate = data.expectedReturnRate / 100;
    const i = annualRate / 12; // monthly interest rate
    const t_years = data.investmentPeriodYears;
    const n = t_years * 12; // number of months
    
    // Lumpsum Calculation
    const lumpsumFutureValue = P_lumpsum * Math.pow(1 + annualRate, t_years); // Compounded annually for lumpsum

    // SIP Calculation
    const P_sip = data.totalInvestment / n; // Monthly investment for SIP
    const sipFutureValue = P_sip * ( (Math.pow(1 + i, n) - 1) / i ) * (1 + i);
    
    setResult({ 
        lumpsumFutureValue: parseFloat(lumpsumFutureValue.toFixed(2)),
        sipFutureValue: parseFloat(sipFutureValue.toFixed(2)),
        totalInvested: parseFloat(data.totalInvestment.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">SIP vs. Lumpsum Calculator</CardTitle>
        <CardDescription>Compare the potential returns of SIP and Lumpsum investment strategies.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="totalInvestment">Total Investment Amount ({currency.symbol})</Label>
            <Input id="totalInvestment" type="number" step="any" {...form.register('totalInvestment')} />
            {form.formState.errors.totalInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.totalInvestment.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Compare</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Comparison Results</h3>
          <p><strong>Total Amount Invested:</strong> {currency.symbol}{result.totalInvested.toLocaleString()}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Lumpsum Investment:</h4>
                <p>Estimated Future Value: {currency.symbol}{result.lumpsumFutureValue.toLocaleString()}</p>
            </div>
            <div>
                <h4 className="font-semibold">SIP Investment:</h4>
                <p>Estimated Future Value: {currency.symbol}{result.sipFutureValue.toLocaleString()}</p>
                 <p className="text-xs">(Monthly investment of {currency.symbol}{(result.totalInvested / (form.getValues("investmentPeriodYears")*12)).toLocaleString()})</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
