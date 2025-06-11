
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
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { TooltipPayload } from 'recharts'; // Added this import

const formSchema = z.object({
  potentialProfit: z.coerce.number().min(0.01, "Potential profit must be greater than 0"),
  potentialLoss: z.coerce.number().min(0.01, "Potential loss must be greater than 0"),
});
type FormData = z.infer<typeof formSchema>;

interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  riskRewardRatio: string; // Display as "1 : X"
  pieChartData: PieChartDataPoint[];
  pieChartConfig: ChartConfig;
}

export function RiskRewardRatioCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { potentialProfit: 30, potentialLoss: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const ratio = data.potentialProfit / data.potentialLoss;

    const pieChartData: PieChartDataPoint[] = [
      { name: 'Potential Profit', value: data.potentialProfit, fill: 'hsl(var(--chart-1))' },
      { name: 'Potential Loss', value: data.potentialLoss, fill: 'hsl(var(--chart-2))' },
    ].filter(d => d.value > 0);

    const pieChartConfig: ChartConfig = {
      'Potential Profit': { label: `Potential Profit (${currency.symbol})`, color: 'hsl(var(--chart-1))' },
      'Potential Loss': { label: `Potential Loss (${currency.symbol})`, color: 'hsl(var(--chart-2))' },
    };
    
    setResult({ 
      riskRewardRatio: `1 : ${ratio.toFixed(2)}`,
      pieChartData,
      pieChartConfig,
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
          {percentage && <p>{`Percentage of Total Compared: ${percentage}%`}</p>}
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Risk/Reward Ratio Calculator</CardTitle>
        <CardDescription>Assess the risk vs. potential reward of an investment or trade.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="potentialProfit">Potential Profit ({currency.symbol})</Label>
            <Input id="potentialProfit" type="number" step="any" {...form.register('potentialProfit')} />
            {form.formState.errors.potentialProfit && <p className="text-sm text-destructive mt-1">{form.formState.errors.potentialProfit.message}</p>}
          </div>
          <div>
            <Label htmlFor="potentialLoss">Potential Loss (Risk) ({currency.symbol})</Label>
            <Input id="potentialLoss" type="number" step="any" {...form.register('potentialLoss')} />
            {form.formState.errors.potentialLoss && <p className="text-sm text-destructive mt-1">{form.formState.errors.potentialLoss.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Currency for Input Fields</Label>
            <CurrencyToggle
              id="currency-toggle"
              selectedCurrency={currency}
              onCurrencyChange={(newCurrency) => {
                setCurrency(newCurrency);
                // Re-calculate if form has values and result exists to update currency symbol in pieChartConfig
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
          <p className="mb-6"><strong>Risk/Reward Ratio:</strong> {result.riskRewardRatio}</p>

          {result.pieChartData && result.pieChartData.length > 0 && result.pieChartConfig && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Profit vs. Loss Comparison</h4>
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
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
