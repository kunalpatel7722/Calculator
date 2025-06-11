
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  initialInvestment: z.coerce.number().min(0.01, "Initial investment must be greater than 0"),
  currentValue: z.coerce.number().min(0, "Current value must be non-negative"),
});
type FormData = z.infer<typeof formSchema>;

interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  initialInvestment: number;
  currentValue: number;
  roiPercentage: number;
  profitLoss: number;
  chartData: ChartDataPoint[];
}

export function BitcoinRoiCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 1000, currentValue: 1500 },
  });
  
  const chartConfig = {
    initialInvestment: { label: `Initial Investment (${currency.symbol})`, color: "hsl(var(--chart-2))" },
    currentValue: { label: `Current Value (${currency.symbol})`, color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const profitLoss = data.currentValue - data.initialInvestment;
    const roiPercentage = data.initialInvestment !== 0 ? (profitLoss / data.initialInvestment) * 100 : 0;

    const chartData: ChartDataPoint[] = [
      { name: 'Initial Investment', value: parseFloat(data.initialInvestment.toFixed(2)), fill: chartConfig.initialInvestment.color },
      { name: 'Current Value', value: parseFloat(data.currentValue.toFixed(2)), fill: chartConfig.currentValue.color },
    ];

    setResult({ 
      initialInvestment: data.initialInvestment,
      currentValue: data.currentValue,
      roiPercentage: parseFloat(roiPercentage.toFixed(2)),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
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
        <CardTitle className="font-headline text-2xl">Bitcoin ROI Calculator</CardTitle>
        <CardDescription>Calculate your Return on Investment for Bitcoin or other crypto assets.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
          </div>
          <div>
            <Label htmlFor="currentValue">Current Value ({currency.symbol})</Label>
            <Input id="currentValue" type="number" step="any" {...form.register('currentValue')} />
            {form.formState.errors.currentValue && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentValue.message}</p>}
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
          <Table className="mb-6">
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Initial Investment</TableCell>
                <TableCell className="text-right">{currency.symbol}{result.initialInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Current Value</TableCell>
                <TableCell className="text-right">{currency.symbol}{result.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Profit/Loss</TableCell>
                <TableCell className={`text-right font-semibold ${result.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>{currency.symbol}{result.profitLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ROI Percentage</TableCell>
                <TableCell className={`text-right font-semibold ${result.roiPercentage >= 0 ? 'text-green-600' : 'text-destructive'}`}>{result.roiPercentage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>

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
