
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
  purchasePrice: z.coerce.number().min(0, "Purchase price must be non-negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be non-negative"),
  shares: z.coerce.number().min(1, "Number of shares must be at least 1"),
});
type FormData = z.infer<typeof formSchema>;

interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  totalInvestment: number;
  totalReturnValue: number;
  profitLoss: number;
  returnPercentage: number;
  chartData: ChartDataPoint[];
}

export function StockReturnCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { purchasePrice: 100, sellingPrice: 120, shares: 10 },
  });
  
  const chartConfig = {
    totalInvestment: { label: `Total Investment (${currency.symbol})`, color: "hsl(var(--chart-2))" },
    totalReturnValue: { label: `Total Return Value (${currency.symbol})`, color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const totalInvestment = data.purchasePrice * data.shares;
    const totalReturnValue = data.sellingPrice * data.shares;
    const profitLoss = totalReturnValue - totalInvestment;
    const returnPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    const chartData: ChartDataPoint[] = [
      { name: 'Total Investment', value: parseFloat(totalInvestment.toFixed(2)), fill: chartConfig.totalInvestment.color },
      { name: 'Total Return Value', value: parseFloat(totalReturnValue.toFixed(2)), fill: chartConfig.totalReturnValue.color },
    ];
    
    setResult({ 
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalReturnValue: parseFloat(totalReturnValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
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
        <CardTitle className="font-headline text-2xl">Stock Return Calculator</CardTitle>
        <CardDescription>Calculate profit or loss from your stock investments.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price per Share ({currency.symbol})</Label>
              <Input id="purchasePrice" type="number" step="any" {...form.register('purchasePrice')} />
              {form.formState.errors.purchasePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.purchasePrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price per Share ({currency.symbol})</Label>
              <Input id="sellingPrice" type="number" step="any" {...form.register('sellingPrice')} />
              {form.formState.errors.sellingPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.sellingPrice.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="shares">Number of Shares</Label>
            <Input id="shares" type="number" {...form.register('shares')} />
            {form.formState.errors.shares && <p className="text-sm text-destructive mt-1">{form.formState.errors.shares.message}</p>}
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
                <TableCell className="font-medium">Total Investment</TableCell>
                <TableCell className="text-right">{currency.symbol}{result.totalInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Return Value</TableCell>
                <TableCell className="text-right">{currency.symbol}{result.totalReturnValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Profit/Loss</TableCell>
                <TableCell className={`text-right font-semibold ${result.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>{currency.symbol}{result.profitLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Return Percentage</TableCell>
                <TableCell className={`text-right font-semibold ${result.returnPercentage >= 0 ? 'text-green-600' : 'text-destructive'}`}>{result.returnPercentage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</TableCell>
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
