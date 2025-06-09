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
  principalAmount: z.coerce.number().min(1, "Principal amount must be greater than 0"),
  loanInterestRate: z.coerce.number().min(0, "Loan interest rate must be non-negative").max(100),
  investmentReturnRate: z.coerce.number().min(0, "Investment return rate must be non-negative").max(100),
  periodYears: z.coerce.number().int().min(1, "Period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualDataPoint {
  year: number;
  investmentValue: number; // Value of principal if invested
  cumulativeLoanInterestSimple: number; // Cumulative simple interest on loan
  netBenefitOfInvesting: number; // investmentValue - principal - cumulativeLoanInterestSimple
}

interface CalculationResult {
  finalInvestmentValue: number;
  finalLoanInterestSimple: number;
  finalNetBenefitOfInvesting: number;
  decisionGuidance: string;
  annualBreakdown: AnnualDataPoint[];
}

export function LoanVsInvestmentCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { principalAmount: 10000, loanInterestRate: 5, investmentReturnRate: 7, periodYears: 5 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.principalAmount;
    const rLoan_annual = data.loanInterestRate / 100;
    const rInvest_annual = data.investmentReturnRate / 100;
    const t_years = data.periodYears;

    const annualBreakdown: AnnualDataPoint[] = [];
    let currentInvestmentValue = P;
    let cumulativeLoanInterestSimple = 0;

    for (let year = 1; year <= t_years; year++) {
      currentInvestmentValue = P * Math.pow(1 + rInvest_annual, year);
      cumulativeLoanInterestSimple = P * rLoan_annual * year; // Simple interest accumulated
      
      const netBenefitOfInvesting = currentInvestmentValue - P - cumulativeLoanInterestSimple;
      
      annualBreakdown.push({
        year,
        investmentValue: parseFloat(currentInvestmentValue.toFixed(2)),
        cumulativeLoanInterestSimple: parseFloat(cumulativeLoanInterestSimple.toFixed(2)),
        netBenefitOfInvesting: parseFloat(netBenefitOfInvesting.toFixed(2)),
      });
    }
    
    const finalInvestmentValue = annualBreakdown.length > 0 ? annualBreakdown[annualBreakdown.length-1].investmentValue : P;
    const finalLoanInterestSimple = annualBreakdown.length > 0 ? annualBreakdown[annualBreakdown.length-1].cumulativeLoanInterestSimple : 0;
    const finalNetBenefitOfInvesting = finalInvestmentValue - P - finalLoanInterestSimple;
    
    let decisionGuidance = "";
    if (finalNetBenefitOfInvesting > 0) {
        decisionGuidance = `Investing appears potentially more beneficial by ${currency.symbol}${finalNetBenefitOfInvesting.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} over ${t_years} years (Simplified: investment compounds, loan interest is simple on original principal).`;
    } else if (finalNetBenefitOfInvesting < 0) {
        decisionGuidance = `Paying off the loan appears potentially more beneficial. Investing would result in a net position of ${currency.symbol}${finalNetBenefitOfInvesting.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} compared to just having the principal after ${t_years} years, considering simple loan interest.`;
    } else {
        decisionGuidance = "The outcomes are roughly similar based on these simplified calculations.";
    }

    setResult({ 
        finalInvestmentValue,
        finalLoanInterestSimple,
        finalNetBenefitOfInvesting,
        decisionGuidance,
        annualBreakdown,
    });
  };

  const chartConfig = {
    investmentValue: {
      label: `Investment Value (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
    },
    loanCost: { // Represents the original principal + cumulative simple interest
      label: `Principal + Loan Interest (${currency.symbol})`,
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
                {`Net Benefit of Investing: ${currency.symbol}${yearData.netBenefitOfInvesting.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
             </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Adjust data for loan cost line in chart: Principal + Cumulative Simple Interest
  const chartData = result?.annualBreakdown.map(item => ({
    ...item,
    loanCost: form.getValues('principalAmount') + item.cumulativeLoanInterestSimple,
  })) || [];


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Loan vs. Investment Calculator</CardTitle>
        <CardDescription>Compare paying off a loan (simple interest) vs. investing the same amount (compound return).</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="principalAmount">Principal Amount (Loan or Investment) ({currency.symbol})</Label>
            <Input id="principalAmount" type="number" step="any" {...form.register('principalAmount')} />
            {form.formState.errors.principalAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.principalAmount.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="loanInterestRate">Loan Annual Interest Rate (%) (Simple)</Label>
              <Input id="loanInterestRate" type="number" step="any" {...form.register('loanInterestRate')} />
              {form.formState.errors.loanInterestRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.loanInterestRate.message}</p>}
            </div>
            <div>
              <Label htmlFor="investmentReturnRate">Expected Annual Investment Return Rate (%) (Compound)</Label>
              <Input id="investmentReturnRate" type="number" step="any" {...form.register('investmentReturnRate')} />
              {form.formState.errors.investmentReturnRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentReturnRate.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="periodYears">Comparison Period (Years)</Label>
            <Input id="periodYears" type="number" {...form.register('periodYears')} />
            {form.formState.errors.periodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.periodYears.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Compare</Button>
        </CardFooter>
      </form>

      {result && result.annualBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Comparison Results</h3>
          <p><strong>Final Investment Value after {form.getValues("periodYears")} years:</strong> {currency.symbol}{result.finalInvestmentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Total Simple Interest on Loan after {form.getValues("periodYears")} years:</strong> {currency.symbol}{result.finalLoanInterestSimple.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Final Net Benefit of Investing (Investment Value - Principal - Loan Interest):</strong> {currency.symbol}{result.finalNetBenefitOfInvesting.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mt-2 font-semibold mb-6">{result.decisionGuidance}</p>
          
          <div className="my-8 h-80 md:h-96">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                    <Line dataKey="investmentValue" type="monotone" name={chartConfig.investmentValue.label} stroke={chartConfig.investmentValue.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                    <Line dataKey="loanCost" type="monotone" name={chartConfig.loanCost.label} stroke={chartConfig.loanCost.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>

          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Investment Value</TableHead>
                  <TableHead>Cumulative Loan Interest (Simple)</TableHead>
                  <TableHead className="text-right">Net Benefit of Investing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.investmentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.cumulativeLoanInterestSimple.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.netBenefitOfInvesting.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">Note: This is a simplified comparison. Real loan calculations often involve amortization. Investment returns are not guaranteed.</p>
        </div>
      )}
    </Card>
  );
}
