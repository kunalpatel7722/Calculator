
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
  value: z.coerce.number(), 
  rate: z.coerce.number().min(0, "Rate must be non-negative").max(100),
  periods: z.coerce.number().int().min(1, "Periods must be at least 1").max(100), // Max 100 for breakdown/chart reasonable
  calculationType: z.enum(['FV', 'PV']),
});
type FormData = z.infer<typeof formSchema>;

interface PeriodDataPoint {
  period: number;
  valueAtPeriodEnd: number;
}

interface CalculationResult {
  calculatedValue: number;
  label: string;
  periodicBreakdown: PeriodDataPoint[];
}

export function TimeValueOfMoneyCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: 1000, rate: 5, periods: 10, calculationType: 'FV' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const r_period = data.rate / 100;
    const periodicBreakdown: PeriodDataPoint[] = [];
    let finalCalculatedValue;
    let label;

    if (data.calculationType === 'FV') {
      label = "Future Value (FV)";
      let currentValue = data.value;
      for (let period = 1; period <= data.periods; period++) {
        currentValue = currentValue * (1 + r_period);
        periodicBreakdown.push({ period, valueAtPeriodEnd: parseFloat(currentValue.toFixed(2)) });
      }
      finalCalculatedValue = currentValue;
    } else { // PV
      label = "Present Value (PV)";
      // For PV breakdown, we typically show how a future value discounts back to present
      // Or how a present value would need to be at each past period to reach the 'value' (FV)
      // Let's show the discounted value at each period going backwards from data.value (as FV)
      let fvReference = data.value;
      finalCalculatedValue = fvReference / Math.pow(1 + r_period, data.periods); // This is the actual PV
      
      // For breakdown, show what PV would be needed at start of each period to reach fvReference
      // Or, show the PV of fvReference at each intermediate period 'i' from future
      for (let period = 1; period <= data.periods; period++) {
         const discountedValue = fvReference / Math.pow(1 + r_period, data.periods - (period -1) );
         // To make graph intuitive (growing from PV to FV):
         // What PV grows to at period 'period' to eventually reach FV
         // So, we graph the growth of the calculated PV.
         const pvCalculated = finalCalculatedValue;
         let valAtPeriod = pvCalculated;
         for (let i=0; i<period; i++) {
            valAtPeriod *= (1+r_period);
         }
         periodicBreakdown.push({ period, valueAtPeriodEnd: parseFloat(valAtPeriod.toFixed(2))});
      }

    }
    
    setResult({ calculatedValue: parseFloat(finalCalculatedValue.toFixed(2)), label, periodicBreakdown });
  };

  const valueLabel = form.watch('calculationType') === 'FV' ? `Present Value (PV) (${currency.symbol})` : `Future Value (FV) (${currency.symbol})`;
  
  const chartConfig = {
    valueAtPeriodEnd: {
      label: `Value (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1">{`Period: ${label}`}</p>
          {payload.map((pld: TooltipPayload<number, string>) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${pld.name}: ${currency.symbol}${pld.value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Time Value of Money (TVM) Calculator</CardTitle>
        <CardDescription>Calculate Present Value (PV) or Future Value (FV) with period breakdown.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="calculationType">Calculate</Label>
             <Select onValueChange={(value) => { form.setValue('calculationType', value as FormData['calculationType']); setResult(null); }} defaultValue={form.getValues('calculationType')}>
                <SelectTrigger id="calculationType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FV">Future Value (FV)</SelectItem>
                  <SelectItem value="PV">Present Value (PV)</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div>
            <Label htmlFor="value">{valueLabel}</Label>
            <Input id="value" type="number" step="any" {...form.register('value')} />
            {form.formState.errors.value && <p className="text-sm text-destructive mt-1">{form.formState.errors.value.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="rate">Interest Rate per Period (%)</Label>
              <Input id="rate" type="number" step="any" {...form.register('rate')} />
              {form.formState.errors.rate && <p className="text-sm text-destructive mt-1">{form.formState.errors.rate.message}</p>}
            </div>
            <div>
              <Label htmlFor="periods">Number of Periods</Label>
              <Input id="periods" type="number" {...form.register('periods')} />
              {form.formState.errors.periods && <p className="text-sm text-destructive mt-1">{form.formState.errors.periods.message}</p>}
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

      {result && result.periodicBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Result</h3>
          <p className="mb-6"><strong>Calculated {result.label}:</strong> {currency.symbol}{result.calculatedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        
          <div className="my-8 h-80 md:h-96">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart accessibilityLayer data={result.periodicBreakdown} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="period" unit="" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(val) => `${currency.symbol}${val.toLocaleString()}`} 
                    />
                    <ChartTooltip content={<CustomTooltip />} cursorStyle={{strokeDasharray: '3 3', strokeWidth: 1.5, fillOpacity: 0.1}}/>
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="valueAtPeriodEnd" type="monotone" name={chartConfig.valueAtPeriodEnd.label} stroke={chartConfig.valueAtPeriodEnd.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>

          <h4 className="text-lg font-semibold mb-2 font-headline">Periodic Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Value at End of Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.periodicBreakdown.map((item) => (
                  <TableRow key={item.period}>
                    <TableCell>{item.period}</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.valueAtPeriodEnd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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

    