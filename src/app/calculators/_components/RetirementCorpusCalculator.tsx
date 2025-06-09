
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
  currentAge: z.coerce.number().int().min(18, "Current age must be at least 18").max(99),
  retirementAge: z.coerce.number().int().min(19, "Retirement age must be greater than current age").max(100),
  monthlyExpensesAtRetirement: z.coerce.number().min(1, "Monthly expenses must be greater than 0"),
  lifeExpectancyPostRetirement: z.coerce.number().int().min(1, "Life expectancy must be at least 1 year").max(50),
  expectedInflationRate: z.coerce.number().min(0).max(20),
  expectedReturnRatePostRetirement: z.coerce.number().min(0).max(20),
}).refine(data => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age.",
  path: ["retirementAge"],
});

type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  requiredCorpus: number; // Placeholder
}

export function RetirementCorpusCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentAge: 30, retirementAge: 60, monthlyExpensesAtRetirement: 5000, lifeExpectancyPostRetirement: 25, expectedInflationRate: 6, expectedReturnRatePostRetirement: 7 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Placeholder: Real retirement corpus calculation is complex.
    // This uses a very simplified approach.
    const annualExpensesAtRetirement = data.monthlyExpensesAtRetirement * 12;
    const yearsInRetirement = data.lifeExpectancyPostRetirement;
    
    // Simplified: average annual withdrawal needed / (return rate - inflation rate)
    // This doesn't account for sequence of returns risk, or changing expenses.
    const realReturnRate = (data.expectedReturnRatePostRetirement - data.expectedInflationRate) / 100;
    
    let requiredCorpus;
    if (realReturnRate <= 0) {
      // If real return is zero or negative, corpus is simply total expenses
      requiredCorpus = annualExpensesAtRetirement * yearsInRetirement;
    } else {
      // Using present value of an annuity formula
      // PV = PMT * [1 - (1 + r)^-n] / r
      // PMT = annualExpensesAtRetirement, r = realReturnRate, n = yearsInRetirement
       requiredCorpus = annualExpensesAtRetirement * (1 - Math.pow(1 + realReturnRate, -yearsInRetirement)) / realReturnRate;
    }


    setResult({ requiredCorpus: parseFloat(requiredCorpus.toFixed(2)) });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Retirement Corpus Calculator</CardTitle>
        <CardDescription>Estimate the corpus needed for your retirement. (Simplified)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="currentAge">Current Age (Years)</Label>
              <Input id="currentAge" type="number" {...form.register('currentAge')} />
              {form.formState.errors.currentAge && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentAge.message}</p>}
            </div>
            <div>
              <Label htmlFor="retirementAge">Expected Retirement Age (Years)</Label>
              <Input id="retirementAge" type="number" {...form.register('retirementAge')} />
              {form.formState.errors.retirementAge && <p className="text-sm text-destructive mt-1">{form.formState.errors.retirementAge.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="monthlyExpensesAtRetirement">Expected Monthly Expenses at Retirement ({currency.symbol})</Label>
            <Input id="monthlyExpensesAtRetirement" type="number" step="any" {...form.register('monthlyExpensesAtRetirement')} />
            {form.formState.errors.monthlyExpensesAtRetirement && <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyExpensesAtRetirement.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="lifeExpectancyPostRetirement">Life Expectancy Post-Retirement (Years)</Label>
              <Input id="lifeExpectancyPostRetirement" type="number" {...form.register('lifeExpectancyPostRetirement')} />
              {form.formState.errors.lifeExpectancyPostRetirement && <p className="text-sm text-destructive mt-1">{form.formState.errors.lifeExpectancyPostRetirement.message}</p>}
            </div>
            <div>
              <Label htmlFor="expectedInflationRate">Expected Annual Inflation Rate (%)</Label>
              <Input id="expectedInflationRate" type="number" step="any" {...form.register('expectedInflationRate')} />
              {form.formState.errors.expectedInflationRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedInflationRate.message}</p>}
            </div>
             <div>
              <Label htmlFor="expectedReturnRatePostRetirement">Expected Post-Retirement Annual Return Rate (%)</Label>
              <Input id="expectedReturnRatePostRetirement" type="number" step="any" {...form.register('expectedReturnRatePostRetirement')} />
              {form.formState.errors.expectedReturnRatePostRetirement && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRatePostRetirement.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate Corpus</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Simplified Estimate)</h3>
          <p><strong>Estimated Retirement Corpus Required:</strong> {currency.symbol}{result.requiredCorpus.toLocaleString()}</p>
          <p className="text-xs mt-2 text-muted-foreground">Note: This is a simplified calculation. Consider consulting a financial advisor for comprehensive retirement planning.</p>
        </div>
      )}
    </Card>
  );
}
