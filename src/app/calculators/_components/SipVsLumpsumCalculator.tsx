
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
  totalInvestment: z.coerce.number().min(1, "Total investment must be greater than 0"),
  expectedReturnRate: z.coerce.number().min(0, "Expected return rate must be non-negative").max(100),
  investmentPeriodYears: z.coerce.number().int().min(1, "Investment period must be at least 1 year").max(50),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualDataPoint {
  year: number;
  sipValue: number;
  lumpsumValue: number;
  totalInvestedSip: number; // Cumulative for SIP
}

interface CalculationResult {
  lumpsumFutureValue: number;
  sipFutureValue: number;
  totalInvested: number;
  annualBreakdown: AnnualDataPoint[];
}

export function SipVsLumpsumCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { totalInvestment: 120000, expectedReturnRate: 12, investmentPeriodYears: 10 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const P_total = data.totalInvestment;
    const annualRate = data.expectedReturnRate / 100;
    const monthlyRate = annualRate / 12;
    const t_years = data.investmentPeriodYears;
    const n_months = t_years * 12;
    
    // Lumpsum Final Calculation (compounded annually)
    const lumpsumFutureValueFinal = P_total * Math.pow(1 + annualRate, t_years);

    // SIP Final Calculation
    const P_sip_monthly = P_total / n_months;
    const sipFutureValueFinal = P_sip_monthly * ((Math.pow(1 + monthlyRate, n_months) - 1) / monthlyRate) * (1 + monthlyRate); // End of period

    const annualBreakdown: AnnualDataPoint[] = [];
    let currentSipValue = 0;
    let currentLumpsumValue = P_total;
    let cumulativeSipInvested = 0;

    for (let year = 1; year <= t_years; year++) {
      // Lumpsum for this year
      currentLumpsumValue = P_total * Math.pow(1 + annualRate, year);

      // SIP for this year
      const months_at_year_end = year * 12;
      currentSipValue = P_sip_monthly * ((Math.pow(1 + monthlyRate, months_at_year_end) - 1) / monthlyRate) * (1 + monthlyRate);
      cumulativeSipInvested = P_sip_monthly * months_at_year_end;
      
      annualBreakdown.push({
        year,
        sipValue: parseFloat(currentSipValue.toFixed(2)),
        lumpsumValue: parseFloat(currentLumpsumValue.toFixed(2)),
        totalInvestedSip: parseFloat(cumulativeSipInvested.toFixed(2)),
      });
    }
    
    setResult({ 
        lumpsumFutureValue: parseFloat(lumpsumFutureValueFinal.toFixed(2)),
        sipFutureValue: parseFloat(sipFutureValueFinal.toFixed(2)),
        totalInvested: parseFloat(P_total.toFixed(2)),
        annualBreakdown,
    });
  };

  const chartConfig = {
    sipValue: {
      label: `SIP Value (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
    },
    lumpsumValue: {
      label: `Lumpsum Value (${currency.symbol})`,
      color: "hsl(var(--chart-2))",
    },
     totalInvestedSip: { // Only for tooltip
      label: `Total Invested (SIP) (${currency.symbol})`,
      color: "hsl(var(--chart-3))",
    }
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
             <p style={{ color: chartConfig.totalInvestedSip.color }}>
                {`${chartConfig.totalInvestedSip.label}: ${currency.symbol}${yearData.totalInvestedSip.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
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
        <CardTitle className="font-headline text-2xl">SIP vs. Lumpsum Calculator</CardTitle>
        <CardDescription>Compare the potential returns of SIP and Lumpsum investment strategies.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="totalInvestment">Total Investment Amount ({currency.symbol})</Label>
            <Input id="totalInvestment" type="number" step="any" {...form.register('totalInvestment')} />
            {form.formState.errors.totalInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.totalInvestment.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Compare</Button>
        </CardFooter>
      </form>

      {result && result.annualBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Comparison Results</h3>
          <p className="mb-2"><strong>Total Amount Invested:</strong> {currency.symbol}{result.totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <h4 className="font-semibold">Lumpsum Investment:</h4>
                <p>Estimated Future Value: {currency.symbol}{result.lumpsumFutureValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div>
                <h4 className="font-semibold">SIP Investment:</h4>
                <p>Estimated Future Value: {currency.symbol}{result.sipFutureValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                 <p className="text-xs">(Monthly investment of {currency.symbol}{(result.totalInvested / (form.getValues("investmentPeriodYears")*12)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</p>
            </div>
          </div>

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
                    <Line dataKey="sipValue" type="monotone" name={chartConfig.sipValue.label} stroke={chartConfig.sipValue.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                    <Line dataKey="lumpsumValue" type="monotone" name={chartConfig.lumpsumValue.label} stroke={chartConfig.lumpsumValue.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>
          
          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>SIP Value</TableHead>
                  <TableHead className="text-right">Lumpsum Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.sipValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.lumpsumValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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

    