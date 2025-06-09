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
  averageMarketReturn: z.coerce.number().min(-100).max(100),
  returnIfBestDaysMissed: z.coerce.number().min(-100).max(100),
  periodYears: z.coerce.number().int().min(1, "Period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualDataPoint {
  year: number;
  valueIfInvested: number;
  valueIfBestDaysMissed: number;
  opportunityCostThisYear: number; // Difference for that specific year's end value
}

interface CalculationResult {
  finalValueIfInvested: number;
  finalValueIfBestDaysMissed: number;
  finalOpportunityCost: number;
  annualBreakdown: AnnualDataPoint[];
}

export function MarketTimingCostCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { initialInvestment: 10000, averageMarketReturn: 7, returnIfBestDaysMissed: 3, periodYears: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P = data.initialInvestment;
    const rMarket_annual = data.averageMarketReturn / 100;
    const rMissed_annual = data.returnIfBestDaysMissed / 100;
    const t_years = data.periodYears;

    const annualBreakdown: AnnualDataPoint[] = [];
    let currentInvestedValue = P;
    let currentMissedValue = P;

    for (let year = 1; year <= t_years; year++) {
      currentInvestedValue = P * Math.pow(1 + rMarket_annual, year);
      currentMissedValue = P * Math.pow(1 + rMissed_annual, year);
      const opportunityCostThisYear = currentInvestedValue - currentMissedValue;
      
      annualBreakdown.push({
        year,
        valueIfInvested: parseFloat(currentInvestedValue.toFixed(2)),
        valueIfBestDaysMissed: parseFloat(currentMissedValue.toFixed(2)),
        opportunityCostThisYear: parseFloat(opportunityCostThisYear.toFixed(2)),
      });
    }
    
    const finalValueIfInvested = annualBreakdown[annualBreakdown.length-1].valueIfInvested;
    const finalValueIfBestDaysMissed = annualBreakdown[annualBreakdown.length-1].valueIfBestDaysMissed;
    const finalOpportunityCost = finalValueIfInvested - finalValueIfBestDaysMissed;
    
    setResult({ 
        finalValueIfInvested,
        finalValueIfBestDaysMissed,
        finalOpportunityCost: parseFloat(finalOpportunityCost.toFixed(2)),
        annualBreakdown,
    });
  };

  const chartConfig = {
    valueIfInvested: {
      label: `Value (Fully Invested) (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
    },
    valueIfBestDaysMissed: {
      label: `Value (Best Days Missed) (${currency.symbol})`,
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
                {`Opportunity Cost: ${currency.symbol}${yearData.opportunityCostThisYear.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
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
        <CardTitle className="font-headline text-2xl">Market Timing Cost Calculator</CardTitle>
        <CardDescription>Understand the potential cost of missing the market's best days with annual comparison.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ({currency.symbol})</Label>
            <Input id="initialInvestment" type="number" step="any" {...form.register('initialInvestment')} />
            {form.formState.errors.initialInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.initialInvestment.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="averageMarketReturn">Average Annual Market Return (%) (If fully invested)</Label>
              <Input id="averageMarketReturn" type="number" step="any" {...form.register('averageMarketReturn')} />
              {form.formState.errors.averageMarketReturn && <p className="text-sm text-destructive mt-1">{form.formState.errors.averageMarketReturn.message}</p>}
            </div>
            <div>
              <Label htmlFor="returnIfBestDaysMissed">Annual Return (%) (If best days are missed)</Label>
              <Input id="returnIfBestDaysMissed" type="number" step="any" {...form.register('returnIfBestDaysMissed')} />
              {form.formState.errors.returnIfBestDaysMissed && <p className="text-sm text-destructive mt-1">{form.formState.errors.returnIfBestDaysMissed.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="periodYears">Investment Period (Years)</Label>
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
          <Button type="submit" className="w-full md:w-auto">Calculate Cost</Button>
        </CardFooter>
      </form>

      {result && result.annualBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p className="mb-2"><strong>Final Portfolio Value (If Fully Invested):</strong> {currency.symbol}{result.finalValueIfInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-2"><strong>Final Portfolio Value (If Best Days Missed):</strong> {currency.symbol}{result.finalValueIfBestDaysMissed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-6"><strong>Total Opportunity Cost of Market Timing:</strong> {currency.symbol}{result.finalOpportunityCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        
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
                    <Line dataKey="valueIfInvested" type="monotone" name={chartConfig.valueIfInvested.label} stroke={chartConfig.valueIfInvested.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                    <Line dataKey="valueIfBestDaysMissed" type="monotone" name={chartConfig.valueIfBestDaysMissed.label} stroke={chartConfig.valueIfBestDaysMissed.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>

          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Value (Fully Invested)</TableHead>
                  <TableHead>Value (Best Days Missed)</TableHead>
                  <TableHead className="text-right">Opportunity Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.valueIfInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{currency.symbol}{item.valueIfBestDaysMissed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.opportunityCostThisYear.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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

    
