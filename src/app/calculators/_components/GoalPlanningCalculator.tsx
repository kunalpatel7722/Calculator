
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
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  yearsToGoal: z.coerce.number().int().min(1, "Years to goal must be at least 1").max(100),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  initialInvestment: z.coerce.number().min(0, "Initial investment must be non-negative").optional().default(0),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualDataPoint {
  year: number;
  totalInvested: number; // Cumulative principal invested
  interestEarnedYearly: number; // Interest earned just in that year
  endValue: number; // Value at the end of the year
}

interface CalculationResult {
  requiredMonthlyInvestment: number;
  annualBreakdown: AnnualDataPoint[];
  totalInvestedAtEnd: number;
  totalInterestEarnedAtEnd: number;
}

export function GoalPlanningCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { targetAmount: 50000, yearsToGoal: 5, expectedReturnRate: 7, initialInvestment: 1000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const r_monthly = data.expectedReturnRate / 100 / 12;
    const n_months = data.yearsToGoal * 12;
    const FV = data.targetAmount;
    const PV = data.initialInvestment || 0;

    let pmt; // Required Monthly Investment
    if (r_monthly === 0) {
      pmt = (FV - PV) / n_months;
    } else {
      pmt = (FV - PV * Math.pow(1 + r_monthly, n_months)) / ((Math.pow(1 + r_monthly, n_months) - 1) / r_monthly);
    }
    pmt = Math.max(0, pmt); // Ensure pmt is not negative if PV already meets FV

    const annualBreakdown: AnnualDataPoint[] = [];
    let currentValue = PV;
    let cumulativeInvested = PV;

    for (let year = 1; year <= data.yearsToGoal; year++) {
      const P_year_start = currentValue;
      let interestThisYear = 0;
      let principalAddedThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        const monthlyInterest = currentValue * r_monthly;
        interestThisYear += monthlyInterest;
        currentValue += monthlyInterest;
        currentValue += pmt;
        principalAddedThisYear += pmt;
      }
      cumulativeInvested += principalAddedThisYear;
      annualBreakdown.push({
        year,
        totalInvested: cumulativeInvested,
        interestEarnedYearly: interestThisYear,
        endValue: currentValue,
      });
    }
    
    const totalInterestEarnedAtEnd = currentValue - cumulativeInvested;

    setResult({
      requiredMonthlyInvestment: parseFloat(pmt.toFixed(2)),
      annualBreakdown,
      totalInvestedAtEnd: cumulativeInvested,
      totalInterestEarnedAtEnd: parseFloat(totalInterestEarnedAtEnd.toFixed(2)),
    });
  };
  
  const chartConfig = {
    endValue: {
      label: `Portfolio Value (${currency.symbol})`,
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
              {`${pld.name}: ${currency.symbol}${pld.value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            </p>
          ))}
           {yearData && (
             <p style={{ color: "hsl(var(--chart-3))" }}>
                {`Interest This Year: ${currency.symbol}${yearData.interestEarnedYearly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
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
        <CardTitle className="font-headline text-2xl">Financial Goal Planning Calculator</CardTitle>
        <CardDescription>Plan investments to reach your financial goals. Calculates required monthly investment and shows growth.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="targetAmount">Target Amount ({currency.symbol})</Label>
            <Input id="targetAmount" type="number" step="any" {...form.register('targetAmount')} />
            {form.formState.errors.targetAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.targetAmount.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="yearsToGoal">Years to Reach Goal</Label>
              <Input id="yearsToGoal" type="number" {...form.register('yearsToGoal')} />
              {form.formState.errors.yearsToGoal && <p className="text-sm text-destructive mt-1">{form.formState.errors.yearsToGoal.message}</p>}
            </div>
            <div>
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input id="expectedReturnRate" type="number" step="any" {...form.register('expectedReturnRate')} />
              {form.formState.errors.expectedReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRate.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="initialInvestment">Initial Investment (Optional) ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
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
          <p className="mb-2"><strong>Required Monthly Investment:</strong> {currency.symbol}{result.requiredMonthlyInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-2"><strong>Total Invested by End of Period:</strong> {currency.symbol}{result.totalInvestedAtEnd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-6"><strong>Total Interest Earned by End of Period:</strong> {currency.symbol}{result.totalInterestEarnedAtEnd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          
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
                    <Line dataKey="endValue" type="monotone" name={chartConfig.endValue.label} stroke={chartConfig.endValue.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
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
                  <TableHead>Interest Earned (Yearly)</TableHead>
                  <TableHead className="text-right">End Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.interestEarnedYearly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.endValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <p className="text-xs mt-2 text-muted-foreground">Note: Assumes consistent monthly investments and returns compounded monthly. This is a simplified calculation.</p>
        </div>
      )}
    </Card>
  );
}

    