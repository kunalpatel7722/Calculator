
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  monthlyInvestment: z.coerce.number().min(1, "Monthly investment must be greater than 0"),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  investmentPeriodYears: z.coerce.number().int().min(1, "Investment period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualSipDataPoint {
  year: number;
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
}

interface CalculationResult {
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  annualBreakdown: AnnualSipDataPoint[];
}

export function SipCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { monthlyInvestment: 5000, expectedReturnRate: 12, investmentPeriodYears: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.monthlyInvestment;
    const annualRate = data.expectedReturnRate / 100;
    const i = annualRate / 12; // monthly interest rate
    const totalYears = data.investmentPeriodYears;
    const n_total_months = totalYears * 12;

    const overallFutureValue = P * ( (Math.pow(1 + i, n_total_months) - 1) / i ) * (1 + i);
    const overallTotalInvested = P * n_total_months;
    const overallEstimatedReturns = overallFutureValue - overallTotalInvested;

    const annualBreakdown: AnnualSipDataPoint[] = [];
    for (let year = 1; year <= totalYears; year++) {
      const current_months = year * 12;
      const fv_at_year = P * ( (Math.pow(1 + i, current_months) - 1) / i ) * (1 + i);
      const ti_at_year = P * current_months;
      const er_at_year = fv_at_year - ti_at_year;
      annualBreakdown.push({
        year,
        totalInvested: parseFloat(ti_at_year.toFixed(2)),
        estimatedReturns: parseFloat(er_at_year.toFixed(2)),
        futureValue: parseFloat(fv_at_year.toFixed(2)),
      });
    }
    
    setResult({ 
        totalInvested: parseFloat(overallTotalInvested.toFixed(2)),
        estimatedReturns: parseFloat(overallEstimatedReturns.toFixed(2)),
        futureValue: parseFloat(overallFutureValue.toFixed(2)),
        annualBreakdown,
    });
  };

  const chartConfig = {
    futureValue: {
      label: `Future Value (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
    },
    totalInvested: {
      label: `Total Invested (${currency.symbol})`,
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const yearData = result?.annualBreakdown.find(d => d.year.toString() === label);
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1">{`Year: ${label}`}</p>
          {payload.map((pld: TooltipPayload<number, string>) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${pld.name}: ${currency.symbol}${pld.value?.toLocaleString()}`}
            </p>
          ))}
           {yearData && (
             <p style={{ color: "hsl(var(--chart-3))" }}>
                {`Est. Returns This Year: ${currency.symbol}${yearData.estimatedReturns.toLocaleString()}`}
             </p>
          )}
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">SIP (Systematic Investment Plan) Calculator</CardTitle>
        <CardDescription>Project the future value of your SIP investments with an annual breakdown and growth chart.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="monthlyInvestment">Monthly Investment ({currency.symbol})</Label>
            <Input id="monthlyInvestment" type="number" step="any" {...form.register('monthlyInvestment')} />
            {form.formState.errors.monthlyInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyInvestment.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input id="expectedReturnRate" type="number" step="any" {...form.register('expectedReturnRate')} />
              {form.formState.errors.expectedReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRate.message}</p>}
            </div>
            <div>
              <Label htmlFor="investmentPeriodYears">Investment Period (Years)</Label>
              <Input id="investmentPeriodYears" type="number" {...form.register('investmentPeriodYears')} />
              {form.formState.errors.investmentPeriodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentPeriodYears.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Overall Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-lg">
            <p><strong>Total Invested:</strong> {currency.symbol}{result.totalInvested.toLocaleString()}</p>
            <p><strong>Est. Returns:</strong> {currency.symbol}{result.estimatedReturns.toLocaleString()}</p>
            <p><strong>Future Value:</strong> {currency.symbol}{result.futureValue.toLocaleString()}</p>
          </div>

          <div className="mb-8 h-80 md:h-96">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart accessibilityLayer data={result.annualBreakdown} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit="yr" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(value) => `${currency.symbol}${value.toLocaleString()}`} 
                    />
                    <ChartTooltip content={<CustomTooltip />} cursorStyle={{strokeDasharray: '3 3', strokeWidth: 1.5, fillOpacity: 0.1}}/>
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="futureValue" type="monotone" name={chartConfig.futureValue.label} stroke={chartConfig.futureValue.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                    <Line dataKey="totalInvested" type="monotone" name={chartConfig.totalInvested.label} stroke={chartConfig.totalInvested.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>
          
          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Invested</TableHead>
                  <TableHead>Estimated Returns</TableHead>
                  <TableHead className="text-right">Future Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.totalInvested.toLocaleString()}</TableCell>
                    <TableCell>{currency.symbol}{item.estimatedReturns.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.futureValue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Card>
  );
}
