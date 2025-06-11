
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { TooltipPayload } from 'recharts';

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

interface BarChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  requiredCorpus: number;
  totalNominalExpenses: number;
  barChartData: BarChartDataPoint[];
  barChartConfig: ChartConfig;
}

export function RetirementCorpusCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentAge: 30, retirementAge: 60, monthlyExpensesAtRetirement: 5000, lifeExpectancyPostRetirement: 25, expectedInflationRate: 6, expectedReturnRatePostRetirement: 7 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const annualExpensesAtRetirement = data.monthlyExpensesAtRetirement * 12;
    const yearsInRetirement = data.lifeExpectancyPostRetirement;
    
    const realReturnRate = (data.expectedReturnRatePostRetirement - data.expectedInflationRate) / 100;
    
    let calculatedRequiredCorpus;
    if (realReturnRate <= 0) {
      calculatedRequiredCorpus = annualExpensesAtRetirement * yearsInRetirement;
    } else {
       calculatedRequiredCorpus = annualExpensesAtRetirement * (1 - Math.pow(1 + realReturnRate, -yearsInRetirement)) / realReturnRate;
    }

    const totalNominalExpenses = data.monthlyExpensesAtRetirement * 12 * data.lifeExpectancyPostRetirement;

    const currentBarChartConfig: ChartConfig = {
      requiredCorpus: { label: `Required Corpus (${currency.symbol})`, color: "hsl(var(--chart-1))" },
      totalNominalExpenses: { label: `Total Nominal Expenses (${currency.symbol})`, color: "hsl(var(--chart-2))" },
    };

    const barChartData: BarChartDataPoint[] = [
      { name: 'Required Corpus', value: parseFloat(calculatedRequiredCorpus.toFixed(2)), fill: currentBarChartConfig.requiredCorpus.color as string },
      { name: 'Total Nominal Expenses', value: parseFloat(totalNominalExpenses.toFixed(2)), fill: currentBarChartConfig.totalNominalExpenses.color as string },
    ];
    
    setResult({ 
        requiredCorpus: parseFloat(calculatedRequiredCorpus.toFixed(2)),
        totalNominalExpenses: parseFloat(totalNominalExpenses.toFixed(2)),
        barChartData,
        barChartConfig: currentBarChartConfig,
    });
  };

  const CustomTooltip = ({ active, payload, currency: currentCurrency }: TooltipProps<number, string> & { currency: Currency }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1" style={{ color: data.payload.fill }}>{data.name}</p>
          <p>{`Value: ${currentCurrency.symbol}${data.value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
        </div>
      );
    }
    return null;
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
              onCurrencyChange={(newCurrency) => {
                setCurrency(newCurrency);
                if (form.formState.isSubmitted && result) {
                  onSubmit(form.getValues()); // Recalculate with new currency for chart labels
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Calculate Corpus</Button>
        </CardFooter>
      </form>

      {result && result.barChartData && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Simplified Estimate)</h3>
          <p><strong>Estimated Retirement Corpus Required:</strong> {currency.symbol}{result.requiredCorpus.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-4"><strong>Total Nominal Expenses During Retirement (for comparison):</strong> {currency.symbol}{result.totalNominalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          
          {result.barChartData.length > 0 && result.barChartConfig && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Corpus vs. Nominal Expenses</h4>
              <div className="h-80 md:h-96">
                <ChartContainer config={result.barChartConfig} className="w-full h-full">
                  <BarChart accessibilityLayer data={result.barChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      tickFormatter={(value) => `${currency.symbol}${value.toLocaleString()}`}
                    />
                    <ChartTooltip 
                      content={<CustomTooltip currency={currency} />} 
                      cursorStyle={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                    />
                    <Bar dataKey="value" radius={4} barSize={50}>
                      {result.barChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          )}
          <p className="text-xs mt-2 text-muted-foreground">Note: This is a simplified calculation. Consider consulting a financial advisor for comprehensive retirement planning. Nominal expenses do not account for inflation during retirement or investment growth.</p>
        </div>
      )}
    </Card>
  );
}
