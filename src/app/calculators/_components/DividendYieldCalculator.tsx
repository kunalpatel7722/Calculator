
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
  annualDividendPerShare: z.coerce.number().min(0, "Annual dividend must be non-negative"),
  currentMarketPrice: z.coerce.number().min(0.01, "Market price must be greater than 0"),
});
type FormData = z.infer<typeof formSchema>;

interface PieChartDataPoint {
  name: string;
  value: number; // Will store percentage for this chart
  fill: string;
}

interface CalculationResult {
  dividendYield: number;
  pieChartData: PieChartDataPoint[];
  pieChartConfig: ChartConfig;
}

export function DividendYieldCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { annualDividendPerShare: 5, currentMarketPrice: 100 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const dividendYield = (data.annualDividendPerShare / data.currentMarketPrice) * 100;
    const yieldPercentage = parseFloat(dividendYield.toFixed(2));
    const remainingPercentage = parseFloat((100 - yieldPercentage).toFixed(2));

    const pieChartData: PieChartDataPoint[] = [
      { name: 'Dividend Yield', value: yieldPercentage, fill: 'hsl(var(--chart-1))' },
      { name: 'Price (Non-Yield Portion)', value: remainingPercentage > 0 ? remainingPercentage : 0, fill: 'hsl(var(--chart-2))' },
    ].filter(d => d.value > 0.009);

    const pieChartConfig: ChartConfig = {
      'Dividend Yield': { label: 'Dividend Yield (%)', color: 'hsl(var(--chart-1))' },
      'Price (Non-Yield Portion)': { label: 'Price (Non-Yield Portion) (%)', color: 'hsl(var(--chart-2))' },
    };
    
    setResult({ 
      dividendYield: yieldPercentage,
      pieChartData,
      pieChartConfig,
    });
  };

  interface CustomPieTooltipProps extends TooltipProps<number, string> {}

  const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PieChartDataPoint;
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1" style={{ color: data.fill }}>{data.name}</p>
          <p>{`Percentage: ${data.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Dividend Yield Calculator</CardTitle>
        <CardDescription>Determine the dividend yield of a stock.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="annualDividendPerShare">Annual Dividend per Share ({currency.symbol})</Label>
            <Input id="annualDividendPerShare" type="number" step="any" {...form.register('annualDividendPerShare')} />
            {form.formState.errors.annualDividendPerShare && <p className="text-sm text-destructive mt-1">{form.formState.errors.annualDividendPerShare.message}</p>}
          </div>
          <div>
            <Label htmlFor="currentMarketPrice">Current Market Price per Share ({currency.symbol})</Label>
            <Input id="currentMarketPrice" type="number" step="any" {...form.register('currentMarketPrice')} />
            {form.formState.errors.currentMarketPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentMarketPrice.message}</p>}
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
          <p className="mb-6"><strong>Dividend Yield:</strong> {result.dividendYield.toLocaleString()}%</p>

           {result.pieChartData && result.pieChartData.length > 0 && result.pieChartConfig && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Yield vs. Price Portion</h4>
              <div className="h-80 md:h-96 flex justify-center max-h-[300px] sm:max-h-[350px]">
                <ChartContainer config={result.pieChartConfig} className="aspect-square w-full h-full">
                  <PieChart>
                    <ChartTooltip 
                      content={<CustomPieTooltip />}
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
                      label={({ name, value }) => `${name} (${value.toFixed(0)}%)`}
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
