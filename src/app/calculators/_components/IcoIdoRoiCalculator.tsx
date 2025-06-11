
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps, Cell } from 'recharts'; // Added Cell here
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"; // Removed ChartLegend, ChartLegendContent as they aren't used
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  investmentAmount: z.coerce.number().min(0.01, "Investment amount must be greater than 0"),
  tokensReceived: z.coerce.number().min(0.000001, "Tokens received must be positive"),
  currentTokenPrice: z.coerce.number().min(0, "Current token price must be non-negative"),
});
type FormData = z.infer<typeof formSchema>;

interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  investmentAmount: number;
  currentValue: number;
  profitLoss: number;
  roiPercentage: number;
  chartData: ChartDataPoint[];
}

export function IcoIdoRoiCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { investmentAmount: 100, tokensReceived: 1000, currentTokenPrice: 0.5 },
  });

  const chartConfig = {
    investmentAmount: { label: `Initial Investment (${currency.symbol})`, color: "hsl(var(--chart-2))" },
    currentValue: { label: `Current Value (${currency.symbol})`, color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;


  const onSubmit: SubmitHandler<FormData> = (data) => {
    const currentValue = data.tokensReceived * data.currentTokenPrice;
    const profitLoss = currentValue - data.investmentAmount;
    const roiPercentage = data.investmentAmount > 0 ? (profitLoss / data.investmentAmount) * 100 : 0;
    
    const chartData: ChartDataPoint[] = [
      { name: 'Initial Investment', value: parseFloat(data.investmentAmount.toFixed(2)), fill: chartConfig.investmentAmount.color },
      { name: 'Current Value', value: parseFloat(currentValue.toFixed(2)), fill: chartConfig.currentValue.color },
    ];

    setResult({ 
        investmentAmount: parseFloat(data.investmentAmount.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        roiPercentage: parseFloat(roiPercentage.toFixed(2)),
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
        <CardTitle className="font-headline text-2xl">ICO/IDO ROI Calculator</CardTitle>
        <CardDescription>Calculate ROI for your Initial Coin Offering (ICO) or Initial DEX Offering (IDO) investments.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="investmentAmount">Total Investment Amount ({currency.symbol})</Label>
            <Input id="investmentAmount" type="number" step="any" {...form.register('investmentAmount')} />
            {form.formState.errors.investmentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentAmount.message}</p>}
          </div>
          <div>
            <Label htmlFor="tokensReceived">Number of Tokens Received</Label>
            <Input id="tokensReceived" type="number" step="any" {...form.register('tokensReceived')} />
            {form.formState.errors.tokensReceived && <p className="text-sm text-destructive mt-1">{form.formState.errors.tokensReceived.message}</p>}
          </div>
           <div>
            <Label htmlFor="currentTokenPrice">Current Price per Token ({currency.symbol})</Label>
            <Input id="currentTokenPrice" type="number" step="any" {...form.register('currentTokenPrice')} />
            {form.formState.errors.currentTokenPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentTokenPrice.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Currency</Label>
            <CurrencyToggle
              id="currency-toggle"
              selectedCurrency={currency}
              onCurrencyChange={(newCurrency) => {
                setCurrency(newCurrency);
                // Optionally re-evaluate chart config if currency symbol changes in labels
                setResult(prevResult => prevResult ? {
                    ...prevResult,
                    // chartData might need updated labels if currency symbol is embedded
                } : null);
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
          <p><strong>Initial Investment:</strong> {currency.symbol}{result.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Current Value of Tokens:</strong> {currency.symbol}{result.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Profit/Loss:</strong> <span className={result.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}>{currency.symbol}{result.profitLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
          <p className="mb-6"><strong>ROI Percentage:</strong> <span className={result.roiPercentage >= 0 ? 'text-green-600' : 'text-destructive'}>{result.roiPercentage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</span></p>
        
          {result.chartData && result.chartData.length > 0 && (
            <div className="my-8 h-80 md:h-96">
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
                  <Bar dataKey="value" radius={4}>
                    {result.chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
