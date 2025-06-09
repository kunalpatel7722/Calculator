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
  initialInvestment: z.coerce.number().min(1, "Initial investment must be greater than 0"),
  monthlyWithdrawal: z.coerce.number().min(1, "Monthly withdrawal must be greater than 0"),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  withdrawalPeriodYears: z.coerce.number().int().min(1, "Withdrawal period must be at least 1 year").max(50),
});
// Removed the complex refine for now as the annual breakdown will make depletion clear.

type FormData = z.infer<typeof formSchema>;

interface AnnualSwpDataPoint {
  year: number;
  openingBalance: number;
  interestEarned: number;
  amountWithdrawn: number;
  closingBalance: number;
}

interface CalculationResult {
  totalWithdrawn: number;
  finalBalance: number;
  message?: string;
  annualBreakdown: AnnualSwpDataPoint[];
  corpusDepletionYear?: number;
}

export function SwpCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 1000000, monthlyWithdrawal: 5000, expectedReturnRate: 7, withdrawalPeriodYears: 20 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.initialInvestment;
    const W_monthly = data.monthlyWithdrawal;
    const annualRate = data.expectedReturnRate / 100;
    const i_monthly = annualRate / 12;
    const totalYears = data.withdrawalPeriodYears;

    const annualBreakdown: AnnualSwpDataPoint[] = [];
    let currentBalance = P;
    let cumulativeWithdrawn = 0;
    let corpusDepletionYear: number | undefined = undefined;

    for (let year = 1; year <= totalYears; year++) {
      if (currentBalance <= 0 && !corpusDepletionYear) {
        corpusDepletionYear = year -1; // Depleted in the previous year or start of this year
        // Fill remaining years with 0 balance if needed for chart consistency, or stop early
      }
      if (currentBalance <= 0) {
         annualBreakdown.push({
          year,
          openingBalance: 0,
          interestEarned: 0,
          amountWithdrawn: 0,
          closingBalance: 0,
        });
        continue;
      }

      const openingBalanceForYear = currentBalance;
      let interestEarnedThisYear = 0;
      let withdrawnThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        if (currentBalance <= 0) break; // Stop if corpus depleted mid-year

        const monthlyInterest = currentBalance * i_monthly;
        interestEarnedThisYear += monthlyInterest;
        currentBalance += monthlyInterest;
        
        const actualWithdrawal = Math.min(W_monthly, currentBalance); // Cannot withdraw more than available
        withdrawnThisYear += actualWithdrawal;
        currentBalance -= actualWithdrawal;
        
        if (currentBalance <= 0 && !corpusDepletionYear) {
            corpusDepletionYear = year; // Depleted this year
        }
      }
      
      cumulativeWithdrawn += withdrawnThisYear;
      annualBreakdown.push({
        year,
        openingBalance: parseFloat(openingBalanceForYear.toFixed(2)),
        interestEarned: parseFloat(interestEarnedThisYear.toFixed(2)),
        amountWithdrawn: parseFloat(withdrawnThisYear.toFixed(2)),
        closingBalance: parseFloat(currentBalance.toFixed(2)),
      });
       if (currentBalance <= 0 && !corpusDepletionYear) corpusDepletionYear = year;
    }
    
    let message = "";
    if (corpusDepletionYear !== undefined && corpusDepletionYear <= totalYears && annualBreakdown[annualBreakdown.length-1].closingBalance <=0) {
      message = `The corpus is projected to deplete in approximately year ${corpusDepletionYear}.`;
    } else if (annualBreakdown[annualBreakdown.length-1].closingBalance <=0 ) {
       message = `The corpus is projected to deplete within the specified period.`;
    }


    setResult({
        totalWithdrawn: parseFloat(cumulativeWithdrawn.toFixed(2)),
        finalBalance: parseFloat(currentBalance.toFixed(2)),
        annualBreakdown,
        message: message || undefined,
        corpusDepletionYear,
    });
  };

  const chartConfig = {
    closingBalance: {
      label: `Portfolio Balance (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
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
             <>
              <p style={{ color: "hsl(var(--chart-2))" }}>{`Interest Earned: ${currency.symbol}${yearData.interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
              <p style={{ color: "hsl(var(--chart-3))" }}>{`Amount Withdrawn: ${currency.symbol}${yearData.amountWithdrawn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
             </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">SWP (Systematic Withdrawal Plan) Calculator</CardTitle>
        <CardDescription>Plan your systematic withdrawals and see portfolio longevity.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
          </div>
          <div>
            <Label htmlFor="monthlyWithdrawal">Desired Monthly Withdrawal ({currency.symbol})</Label>
            <Input id="monthlyWithdrawal" type="number" step="any" {...form.register('monthlyWithdrawal')} />
            {form.formState.errors.monthlyWithdrawal && <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyWithdrawal.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expectedReturnRate">Expected Annual Return Rate (%)</Label>
              <Input id="expectedReturnRate" type="number" step="any" {...form.register('expectedReturnRate')} />
              {form.formState.errors.expectedReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedReturnRate.message}</p>}
            </div>
            <div>
              <Label htmlFor="withdrawalPeriodYears">Withdrawal Period (Years)</Label>
              <Input id="withdrawalPeriodYears" type="number" {...form.register('withdrawalPeriodYears')} />
              {form.formState.errors.withdrawalPeriodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.withdrawalPeriodYears.message}</p>}
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

      {result && result.annualBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Total Amount Withdrawn over {form.getValues("withdrawalPeriodYears")} years:</strong> {currency.symbol}{result.totalWithdrawn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Estimated Final Balance after {form.getValues("withdrawalPeriodYears")} years:</strong> {currency.symbol}{result.finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          {result.message && <p className={`text-sm mt-2 ${result.finalBalance <=0 ? 'text-destructive' : 'text-muted-foreground'}`}>{result.message}</p>}
          
          <div className="my-8 h-80 md:h-96">
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
                    <Line dataKey="closingBalance" type="monotone" name={chartConfig.closingBalance.label} stroke={chartConfig.closingBalance.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>

          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Interest Earned</TableHead>
                  <TableHead>Amount Withdrawn</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.openingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.amountWithdrawn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.closingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">Note: This calculation assumes returns are compounded monthly and withdrawals occur mid-month after interest. Market conditions can vary.</p>
        </div>
      )}
    </Card>
  );
}

    
