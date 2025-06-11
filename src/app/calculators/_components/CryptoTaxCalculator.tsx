
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
  totalGains: z.coerce.number().min(0, "Total gains must be non-negative"),
  taxRate: z.coerce.number().min(0, "Tax rate must be non-negative").max(100, "Tax rate cannot exceed 100%"),
});
type FormData = z.infer<typeof formSchema>;

interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface CalculationResult {
  estimatedTax: number;
  netGainsAfterTax: number;
  pieChartData: PieChartDataPoint[];
  pieChartConfig: ChartConfig;
}

export function CryptoTaxCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { totalGains: 5000, taxRate: 20 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const estimatedTax = (data.totalGains * data.taxRate) / 100;
    const netGainsAfterTax = data.totalGains - estimatedTax;

    const pieChartData: PieChartDataPoint[] = [
      { name: 'Estimated Tax', value: estimatedTax, fill: 'hsl(var(--destructive))' },
      { name: 'Net Gains After Tax', value: netGainsAfterTax, fill: 'hsl(var(--chart-1))' },
    ].filter(d => d.value > 0.009); // Filter out tiny or zero segments

    const pieChartConfig: ChartConfig = {
      'Estimated Tax': { label: `Estimated Tax (${currency.symbol})`, color: 'hsl(var(--destructive))' },
      'Net Gains After Tax': { label: `Net Gains After Tax (${currency.symbol})`, color: 'hsl(var(--chart-1))' },
    };
    
    setResult({ 
      estimatedTax: parseFloat(estimatedTax.toFixed(2)),
      netGainsAfterTax: parseFloat(netGainsAfterTax.toFixed(2)),
      pieChartData,
      pieChartConfig
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
          {percentage && <p>{`Percentage of Total Gains: ${percentage}%`}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Crypto Tax Calculator</CardTitle>
        <CardDescription>Estimate potential taxes on your crypto gains. (For informational purposes only, consult a tax professional)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="totalGains">Total Crypto Gains ({currency.symbol})</Label>
            <Input id="totalGains" type="number" step="any" {...form.register('totalGains')} />
            {form.formState.errors.totalGains && <p className="text-sm text-destructive mt-1">{form.formState.errors.totalGains.message}</p>}
          </div>
          <div>
            <Label htmlFor="taxRate">Applicable Tax Rate (%)</Label>
            <Input id="taxRate" type="number" step="any" {...form.register('taxRate')} />
            {form.formState.errors.taxRate && <p className="text-sm text-destructive mt-1">{form.formState.errors.taxRate.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Estimate)</h3>
          <p><strong>Estimated Tax Liability:</strong> {currency.symbol}{result.estimatedTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-6"><strong>Net Gains After Tax:</strong> {currency.symbol}{result.netGainsAfterTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>

          {result.pieChartData && result.pieChartData.length > 0 && result.pieChartConfig && (
            <div className="my-8">
              <h4 className="text-lg font-semibold mb-2 text-center font-headline">Gains Breakdown</h4>
              <div className="h-80 md:h-96 flex justify-center max-h-[300px] sm:max-h-[350px]">
                <ChartContainer config={result.pieChartConfig} className="aspect-square w-full h-full">
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
                      innerRadius={50} 
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
