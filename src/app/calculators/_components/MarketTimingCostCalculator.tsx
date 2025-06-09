
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
  initialInvestment: z.coerce.number().min(1, "Initial investment must be greater than 0"),
  averageMarketReturn: z.coerce.number().min(-100).max(100), // Can be negative
  returnIfBestDaysMissed: z.coerce.number().min(-100).max(100),
  periodYears: z.coerce.number().min(1, "Period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  valueIfInvested: number;
  valueIfBestDaysMissed: number;
  opportunityCost: number;
}

export function MarketTimingCostCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 10000, averageMarketReturn: 7, returnIfBestDaysMissed: 3, periodYears: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.initialInvestment;
    const rMarket = data.averageMarketReturn / 100;
    const rMissed = data.returnIfBestDaysMissed / 100;
    const t = data.periodYears;

    const valueIfInvested = P * Math.pow(1 + rMarket, t);
    const valueIfBestDaysMissed = P * Math.pow(1 + rMissed, t);
    const opportunityCost = valueIfInvested - valueIfBestDaysMissed;
    
    setResult({ 
        valueIfInvested: parseFloat(valueIfInvested.toFixed(2)),
        valueIfBestDaysMissed: parseFloat(valueIfBestDaysMissed.toFixed(2)),
        opportunityCost: parseFloat(opportunityCost.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Market Timing Cost Calculator</CardTitle>
        <CardDescription>Understand the potential cost of missing the market's best days.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="averageMarketReturn">Average Annual Market Return (%) (If fully invested)</Label>
              <Input id="averageMarketReturn" type="number" step="any" {...form.register('averageMarketReturn')} />
              {form.formState.errors.averageMarketReturn && <p className="text-sm text-destructive mt-1">{form.formState.errors.averageMarketReturn.message}</p>}
            </div>
            <div>
              <Label htmlFor="returnIfBestDaysMissed">Annual Return (%) (If best days are missed)</Label>
              <Input id="returnIfBestDaysMissed" type="number" step="any" {...form.register('returnIfBestDaysMissed')} />
              {form.formState.errors.returnIfBestDaysMissed && <p className="text-sm text-destructive mt-1">{form.formState.errors.returnIfBestDaysMissed.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="periodYears">Investment Period (Years)</Label>
            <Input id="periodYears" type="number" {...form.register('periodYears')} />
            {form.formState.errors.periodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.periodYears.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate Cost</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Portfolio Value (If Fully Invested):</strong> {currency.symbol}{result.valueIfInvested.toLocaleString()}</p>
          <p><strong>Portfolio Value (If Best Days Missed):</strong> {currency.symbol}{result.valueIfBestDaysMissed.toLocaleString()}</p>
          <p><strong>Opportunity Cost of Market Timing:</strong> {currency.symbol}{result.opportunityCost.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
