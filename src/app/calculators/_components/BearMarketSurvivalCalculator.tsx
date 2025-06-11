
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  portfolioValue: z.coerce.number().min(1, "Portfolio value must be greater than 0"),
  potentialDrawdown: z.coerce.number().min(1, "Potential drawdown must be at least 1%").max(100, "Drawdown cannot exceed 100%"),
  recoveryRate: z.coerce.number().min(0.1, "Recovery rate must be positive").max(100, "Recovery rate unrealistic if too high").optional(),
});
type FormData = z.infer<typeof formSchema>;

interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  portfolioValue: number;
  valueAfterDrawdown: number;
  percentageNeededToRecover: number;
  chartData: ChartDataPoint[];
}

export function BearMarketSurvivalCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { portfolioValue: 100000, potentialDrawdown: 30, recoveryRate: 7 },
  });

  const chartConfig = {
    portfolioValue: { label: `Initial Value (${currency.symbol})`, color: "hsl(var(--chart-1))" },
    valueAfterDrawdown: { label: `Value After Drawdown (${currency.symbol})`, color: "hsl(var(--destructive))" },
  } satisfies ChartConfig;

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const drawdownDecimal = data.potentialDrawdown / 100;
    const valueAfterDrawdown = data.portfolioValue * (1 - drawdownDecimal);
    const percentageNeededToRecover = valueAfterDrawdown > 0 ? (data.portfolioValue / valueAfterDrawdown - 1) * 100 : (data.portfolioValue > 0 ? Infinity : 0);
    
    const chartData: ChartDataPoint[] = [
      { name: 'Initial Value', value: parseFloat(data.portfolioValue.toFixed(2)), fill: chartConfig.portfolioValue.color },
      { name: 'Value After Drawdown', value: parseFloat(valueAfterDrawdown.toFixed(2)), fill: chartConfig.valueAfterDrawdown.color },
    ];

    setResult({ 
        portfolioValue: data.portfolioValue,
        valueAfterDrawdown: parseFloat(valueAfterDrawdown.toFixed(2)),
        percentageNeededToRecover: parseFloat(percentageNeededToRecover.toFixed(2)),
        chartData,
    });
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1" style={{ color: data.payload.fill }}>{data.name}</p>
          <p>{`Value: ${currency.symbol}${data.value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Bear Market Survival Calculator</CardTitle>
        <CardDescription>Assess portfolio resilience and recovery in bear markets.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="portfolioValue">Current Portfolio Value ({currency.symbol})</Label>
            <Input id="portfolioValue" type="number" step="any" {...form.register('portfolioValue')} />
            {form.formState.errors.portfolioValue && <p className="text-sm text-destructive mt-1">{form.formState.errors.portfolioValue.message}</p>}
          </div>
          <div>
            <Label htmlFor="potentialDrawdown">Potential Market Drawdown (%)</Label>
            <Input id="potentialDrawdown" type="number" step="any" {...form.register('potentialDrawdown')} />
            {form.formState.errors.potentialDrawdown && <p className="text-sm text-destructive mt-1">{form.formState.errors.potentialDrawdown.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Portfolio Value After {form.getValues("potentialDrawdown")}% Drawdown:</strong> {currency.symbol}{result.valueAfterDrawdown.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="mb-6"><strong>Percentage Gain Needed to Recover to Original Value:</strong> {isFinite(result.percentageNeededToRecover) ? result.percentageNeededToRecover.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%' : 'N/A (Value is zero)'}</p>
       
          {result.chartData && result.chartData.length > 0 && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Portfolio Value Comparison</h4>
              <div className="h-80 md:h-96">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <BarChart accessibilityLayer data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      tickFormatter={(value) => `${currency.symbol}${value.toLocaleString()}`}
                    />
                    <ChartTooltip 
                      content={<CustomTooltip />} 
                      cursorStyle={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                    />
                    <Bar dataKey="value" radius={4} barSize={40}>
                      {result.chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
