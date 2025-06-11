
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
  purchasePrice: z.coerce.number().min(1, "Purchase price must be greater than 0"),
  salePrice: z.coerce.number().min(0, "Sale price must be non-negative"),
  totalExpenses: z.coerce.number().min(0, "Total expenses must be non-negative (renovations, fees, etc.)"),
  rentalIncome: z.coerce.number().min(0, "Total rental income must be non-negative (if applicable)").optional(),
});
type FormData = z.infer<typeof formSchema>;

interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  netProfit: number;
  roiPercentage: number;
  initialInvestment: number;
  totalRevenue: number;
  pieChartData: PieChartDataPoint[];
  pieChartConfig: ChartConfig;
}

export function RealEstateRoiCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { purchasePrice: 200000, salePrice: 250000, totalExpenses: 10000, rentalIncome: 12000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const initialInvestment = data.purchasePrice + data.totalExpenses;
    const totalRevenue = data.salePrice + (data.rentalIncome || 0);
    const netProfit = totalRevenue - initialInvestment;
    const roiPercentage = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;

    const newPieChartData: PieChartDataPoint[] = [];
    const newPieChartConfig: ChartConfig = {};

    newPieChartData.push({ name: 'Initial Investment', value: initialInvestment, fill: 'hsl(var(--chart-2))' });
    newPieChartConfig['Initial Investment'] = { label: `Initial Investment (${currency.symbol})`, color: 'hsl(var(--chart-2))' };

    if (netProfit >= 0) {
      if (netProfit > 0) {
        newPieChartData.push({ name: 'Net Profit', value: netProfit, fill: 'hsl(var(--chart-1))' });
        newPieChartConfig['Net Profit'] = { label: `Net Profit (${currency.symbol})`, color: 'hsl(var(--chart-1))' };
      }
    } else {
      newPieChartData.push({ name: 'Net Loss', value: Math.abs(netProfit), fill: 'hsl(var(--destructive))' });
      newPieChartConfig['Net Loss'] = { label: `Net Loss (${currency.symbol})`, color: 'hsl(var(--destructive))' };
    }
    
    setResult({ 
        netProfit: parseFloat(netProfit.toFixed(2)),
        roiPercentage: parseFloat(roiPercentage.toFixed(2)),
        initialInvestment: parseFloat(initialInvestment.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pieChartData: newPieChartData.filter(d => d.value > 0.009),
        pieChartConfig: newPieChartConfig,
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
          {/* The pie chart shows actual values, so percentage of total might be confusing in this context */}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Real Estate ROI Calculator</CardTitle>
        <CardDescription>Calculate the Return on Investment for your real estate properties.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price ({currency.symbol})</Label>
              <Input id="purchasePrice" type="number" step="any" {...form.register('purchasePrice')} />
              {form.formState.errors.purchasePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.purchasePrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price ({currency.symbol})</Label>
              <Input id="salePrice" type="number" step="any" {...form.register('salePrice')} />
              {form.formState.errors.salePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.salePrice.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <Label htmlFor="totalExpenses">Total Expenses ({currency.symbol}) (Renovations, Fees, etc.)</Label>
              <Input id="totalExpenses" type="number" step="any" {...form.register('totalExpenses')} />
              {form.formState.errors.totalExpenses && <p className="text-sm text-destructive mt-1">{form.formState.errors.totalExpenses.message}</p>}
            </div>
            <div>
              <Label htmlFor="rentalIncome">Total Rental Income (Optional) ({currency.symbol})</Label>
              <Input id="rentalIncome" type="number" step="any" {...form.register('rentalIncome')} />
              {form.formState.errors.rentalIncome && <p className="text-sm text-destructive mt-1">{form.formState.errors.rentalIncome.message}</p>}
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
                   onSubmit(form.getValues());
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Calculate ROI</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Initial Investment (Purchase + Expenses):</strong> {currency.symbol}{result.initialInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Total Revenue (Sale + Rental Income):</strong> {currency.symbol}{result.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Net Profit/Loss:</strong> <span className={result.netProfit >= 0 ? 'text-green-600' : 'text-destructive'}>{currency.symbol}{result.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
          <p className="mb-6"><strong>ROI Percentage:</strong> <span className={result.roiPercentage >= 0 ? 'text-green-600' : 'text-destructive'}>{result.roiPercentage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</span></p>

          {result.pieChartData && result.pieChartData.length > 0 && result.pieChartConfig && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Investment Breakdown</h4>
              <div className="h-80 md:h-96 flex justify-center">
                <ChartContainer config={result.pieChartConfig} className="aspect-square max-h-[300px] sm:max-h-[350px]">
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
                      label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
