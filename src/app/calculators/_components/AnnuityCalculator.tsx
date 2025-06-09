'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyToggle, AVAILABLE_CURRENCIES, type Currency } from '@/components/shared/CurrencyToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  principal: z.coerce.number().min(1, "Principal amount must be greater than 0"),
  interestRate: z.coerce.number().min(0, "Interest rate must be non-negative").max(100),
  years: z.coerce.number().int().min(1, "Number of years must be at least 1").max(50),
  paymentFrequency: z.enum(['monthly', 'quarterly', 'annually']),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualAnnuityDataPoint {
  year: number;
  openingBalance: number;
  interestEarned: number; // Interest earned on balance during the year
  paymentsMade: number; // Total payments made during the year
  closingBalance: number;
}

interface CalculationResult {
  periodicPayment: number;
  totalPayments: number;
  totalInterestPaidOrEarned: number; // From perspective of principal decreasing, it's interest paid by the fund
  annualBreakdown: AnnualAnnuityDataPoint[];
  corpusDepletionYear?: number;
}

export function AnnuityCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { principal: 100000, interestRate: 5, years: 10, paymentFrequency: 'monthly' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.principal;
    const annualRate = data.interestRate / 100;
    const totalPayoutYears = data.years;
    
    let periodsPerYear = 12;
    if (data.paymentFrequency === 'quarterly') periodsPerYear = 4;
    if (data.paymentFrequency === 'annually') periodsPerYear = 1;

    const n_total_periods = totalPayoutYears * periodsPerYear;
    const r_periodic = annualRate / periodsPerYear;
    
    let pmt; // Periodic Payment
    if (r_periodic === 0) {
        pmt = P / n_total_periods;
    } else {
        pmt = (P * r_periodic * Math.pow(1 + r_periodic, n_total_periods)) / (Math.pow(1 + r_periodic, n_total_periods) - 1);
    }
    
    const annualBreakdown: AnnualAnnuityDataPoint[] = [];
    let currentBalance = P;
    let cumulativePayments = 0;
    let cumulativeInterest = 0;
    let corpusDepletionYear: number | undefined = undefined;

    for (let year = 1; year <= totalPayoutYears; year++) {
       if (currentBalance <= 0 && !corpusDepletionYear) {
        corpusDepletionYear = year - 1;
      }
      if (currentBalance <=0 && year > 1) { // Stop if balance depleted unless it's year 1 and pmt > principal
         annualBreakdown.push({
          year,
          openingBalance: 0,
          interestEarned: 0,
          paymentsMade: 0,
          closingBalance: 0,
        });
        continue;
      }

      const openingBalanceForYear = currentBalance;
      let interestThisYear = 0;
      let paymentsThisYear = 0;

      for (let period = 1; period <= periodsPerYear; period++) {
        if (currentBalance <= 0) break;
        
        const interestForPeriod = currentBalance * r_periodic;
        interestThisYear += interestForPeriod;
        currentBalance += interestForPeriod; // Interest accrues
        
        const actualPaymentThisPeriod = Math.min(pmt, currentBalance); // Cannot pay more than available
        paymentsThisYear += actualPaymentThisPeriod;
        currentBalance -= actualPaymentThisPeriod; // Payment reduces balance
        
        if (currentBalance <= 0 && !corpusDepletionYear) {
            corpusDepletionYear = year;
        }
      }
      cumulativePayments += paymentsThisYear;
      cumulativeInterest += interestThisYear;

      annualBreakdown.push({
        year,
        openingBalance: parseFloat(openingBalanceForYear.toFixed(2)),
        interestEarned: parseFloat(interestThisYear.toFixed(2)),
        paymentsMade: parseFloat(paymentsThisYear.toFixed(2)),
        closingBalance: parseFloat(currentBalance.toFixed(2)),
      });
      if (currentBalance <= 0 && !corpusDepletionYear) corpusDepletionYear = year;
    }

    const totalPaymentsFinal = cumulativePayments; 
    // Total interest is complex here. If annuity is from an insurer, this is 'interest portion of payments'.
    // If it's your own fund paying out, it's 'growth that supported payments'.
    // For simplicity, let's take total payments - original principal.
    const totalInterestPaidOrEarned = totalPaymentsFinal - P;

    setResult({ 
        periodicPayment: parseFloat(pmt.toFixed(2)),
        totalPayments: parseFloat(totalPaymentsFinal.toFixed(2)),
        totalInterestPaidOrEarned: parseFloat(totalInterestPaidOrEarned.toFixed(2)),
        annualBreakdown,
        corpusDepletionYear,
    });
  };

  const chartConfig = {
    closingBalance: {
      label: `Remaining Balance (${currency.symbol})`,
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
              <p style={{color: "hsl(var(--chart-2))"}}>{`Interest Earned: ${currency.symbol}${yearData.interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
              <p style={{color: "hsl(var(--chart-3))"}}>{`Payments Made: ${currency.symbol}${yearData.paymentsMade.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
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
        <CardTitle className="font-headline text-2xl">Annuity Payout Calculator</CardTitle>
        <CardDescription>Calculate periodic payments from an annuity principal and see balance projection.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="principal">Principal Amount (Annuity Value) ({currency.symbol})</Label>
            <Input id="principal" type="number" step="any" {...form.register('principal')} />
            {form.formState.errors.principal && <p className="text-sm text-destructive mt-1">{form.formState.errors.principal.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="interestRate">Annual Interest Rate / Growth Rate (%)</Label>
              <Input id="interestRate" type="number" step="any" {...form.register('interestRate')} />
              {form.formState.errors.interestRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.interestRate.message}</p>}
            </div>
             <div>
              <Label htmlFor="years">Number of Years for Payout</Label>
              <Input id="years" type="number" {...form.register('years')} />
              {form.formState.errors.years && <p className="text-sm text-destructive mt-1">{form.formState.errors.years.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select onValueChange={(value) => form.setValue('paymentFrequency', value as FormData['paymentFrequency'])} defaultValue={form.getValues('paymentFrequency')}>
                <SelectTrigger id="paymentFrequency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
            </Select>
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
          <Button type="submit" className="w-full md:w-auto">Calculate Annuity Payment</Button>
        </CardFooter>
      </form>

      {result && result.annualBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Calculated Periodic Payment ({form.getValues('paymentFrequency')}):</strong> {currency.symbol}{result.periodicPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Total Payments Received:</strong> {currency.symbol}{result.totalPayments.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-6"><strong>Total Interest/Growth Supporting Payments:</strong> {currency.symbol}{result.totalInterestPaidOrEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          {result.corpusDepletionYear && result.annualBreakdown[result.annualBreakdown.length -1].closingBalance <= 0 && (
             <p className="text-sm text-destructive mb-4">Note: The principal is projected to deplete in year {result.corpusDepletionYear}.</p>
          )}

          <div className="my-8 h-80 md:h-96">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart accessibilityLayer data={result.annualBreakdown} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit="yr" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(val) => `${currency.symbol}${val.toLocaleString()}`} 
                    />
                    <ChartTooltip content={<CustomTooltip />} cursorStyle={{strokeDasharray: '3 3', strokeWidth: 1.5, fillOpacity: 0.1}}/>
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="closingBalance" type="monotone" name={chartConfig.closingBalance.label} stroke={chartConfig.closingBalance.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>

          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Payout Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Interest/Growth Earned</TableHead>
                  <TableHead>Payments Made</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.openingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.paymentsMade.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.closingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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
