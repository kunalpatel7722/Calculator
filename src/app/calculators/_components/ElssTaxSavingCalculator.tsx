
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
import { PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  investmentAmount: z.coerce.number().min(1, "Investment amount must be greater than 0").max(150000, "Max ELSS deduction under Sec 80C is 1,50,000"), // Max 80C limit
  taxSlabRate: z.coerce.number().min(0, "Tax slab rate must be non-negative").max(100),
});
type FormData = z.infer<typeof formSchema>;

interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  taxSaved: number;
  effectiveInvestmentDeductible: number; // The amount of investment considered for deduction
  pieChartData: PieChartDataPoint[];
  pieChartConfig: ChartConfig;
}

export function ElssTaxSavingCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'INR') || AVAILABLE_CURRENCIES[0]); // Default to INR

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { investmentAmount: 150000, taxSlabRate: 30 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const effectiveInvestmentDeductible = Math.min(data.investmentAmount, 150000); // Cap at 80C limit
    const taxSaved = (effectiveInvestmentDeductible * data.taxSlabRate) / 100;
    const costAfterSaving = effectiveInvestmentDeductible - taxSaved;

    const pieChartData: PieChartDataPoint[] = [
      { name: 'Tax Saved', value: taxSaved, fill: 'hsl(var(--chart-1))' },
      { name: 'Effective Investment Cost (Deductible Part)', value: costAfterSaving, fill: 'hsl(var(--chart-2))' },
    ].filter(d => d.value > 0.009); // Filter out tiny or zero segments

    const pieChartConfig: ChartConfig = {
      'Tax Saved': { label: `Tax Saved (${currency.symbol})`, color: 'hsl(var(--chart-1))' },
      'Effective Investment Cost (Deductible Part)': { label: `Effective Cost (${currency.symbol})`, color: 'hsl(var(--chart-2))' },
    };
    
    setResult({ 
      taxSaved: parseFloat(taxSaved.toFixed(2)),
      effectiveInvestmentDeductible: parseFloat(effectiveInvestmentDeductible.toFixed(2)),
      pieChartData,
      pieChartConfig
    });
  };

  interface CustomPieTooltipProps extends TooltipProps<number, string> {
    currency: Currency;
  }

  const CustomPieTooltip = ({ active, payload, currency: currentCurrency }: CustomPieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PieChartDataPoint;
      const percentage = payload[0].percent !== undefined ? (payload[0].percent * 100).toFixed(2) : null;
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1" style={{ color: data.fill }}>{data.name}</p>
          <p>{`Amount: ${currentCurrency.symbol}${data.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
          {percentage && result && <p>{`(${percentage}% of Deductible Investment: ${currentCurrency.symbol}${result.effectiveInvestmentDeductible.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})})`}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">ELSS Tax Saving Calculator</CardTitle>
        <CardDescription>Calculate potential tax savings with ELSS mutual funds under Section 80C.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="investmentAmount">Investment Amount in ELSS ({currency.symbol})</Label>
            <Input id="investmentAmount" type="number" step="any" {...form.register('investmentAmount')} />
            {form.formState.errors.investmentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentAmount.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">Maximum deduction under Section 80C is {currency.symbol}1,50,000.</p>
          </div>
          <div>
            <Label htmlFor="taxSlabRate">Your Income Tax Slab Rate (%)</Label>
            <Input id="taxSlabRate" type="number" step="any" {...form.register('taxSlabRate')} />
            {form.formState.errors.taxSlabRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.taxSlabRate.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Currency</Label>
            <CurrencyToggle
              id="currency-toggle"
              selectedCurrency={currency}
              onCurrencyChange={(newCurrency) => {
                setCurrency(newCurrency);
                 if (form.formState.isSubmitted && result) {
                   onSubmit(form.getValues());
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Calculate Tax Saved</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-2 font-headline">Results</h3>
          <p className="mb-1"><strong>Investment Amount Considered for Deduction:</strong> {currency.symbol}{result.effectiveInvestmentDeductible.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-6"><strong>Estimated Tax Saved:</strong> {currency.symbol}{result.taxSaved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>

          {result.pieChartData && result.pieChartData.length > 0 && result.pieChartConfig && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Breakdown of Deductible Investment</h4>
              <div className="h-80 md:h-96 flex justify-center max-h-[300px] sm:max-h-[350px]">
                <ChartContainer config={result.pieChartConfig} className="aspect-square w-full h-full">
                  <PieChart>
                    <ChartTooltip 
                      content={<CustomPieTooltip currency={currency}/>}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    />
                    <Pie
                      data={result.pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50} 
                      labelLine={false}
                      label={({ name, percent }) => `${name.startsWith("Effective") ? "Effective Cost" : name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {result.pieChartData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                     <ChartLegend 
                        content={<ChartLegendContent nameKey="name" />} 
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{paddingTop: "20px"}}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
