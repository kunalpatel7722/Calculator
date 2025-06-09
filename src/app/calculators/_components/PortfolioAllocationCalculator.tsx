
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
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  stocks: z.coerce.number().min(0, "Value must be non-negative").optional(),
  bonds: z.coerce.number().min(0, "Value must be non-negative").optional(),
  crypto: z.coerce.number().min(0, "Value must be non-negative").optional(),
  realEstate: z.coerce.number().min(0, "Value must be non-negative").optional(),
  cash: z.coerce.number().min(0, "Value must be non-negative").optional(),
}).refine(data => (data.stocks || 0) + (data.bonds || 0) + (data.crypto || 0) + (data.realEstate || 0) + (data.cash || 0) > 0, {
  message: "Total portfolio value must be greater than 0.",
  path: ["stocks"], 
});

type FormData = z.infer<typeof formSchema>;

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  fill: string; // This will be used by chartConfig as well
}

const COLORS_THEME = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function PortfolioAllocationCalculator() { 
  const [allocation, setAllocation] = useState<AllocationData[] | null>(null);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { stocks: 5000, bonds: 3000, crypto: 1000, realEstate: 0, cash: 1000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const assets = [
      { name: 'Stocks', value: data.stocks || 0, baseColor: COLORS_THEME[0] },
      { name: 'Bonds', value: data.bonds || 0, baseColor: COLORS_THEME[1] },
      { name: 'Crypto', value: data.crypto || 0, baseColor: COLORS_THEME[2] },
      { name: 'Real Estate', value: data.realEstate || 0, baseColor: COLORS_THEME[3] },
      { name: 'Cash', value: data.cash || 0, baseColor: COLORS_THEME[4] },
    ].filter(asset => asset.value > 0);

    const currentTotalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    setTotalValue(currentTotalValue);

    const newAllocationData: AllocationData[] = assets.map((asset, index) => ({
      name: asset.name,
      value: asset.value,
      percentage: parseFloat(((asset.value / currentTotalValue) * 100).toFixed(2)),
      fill: asset.baseColor || COLORS_THEME[index % COLORS_THEME.length],
    }));
    setAllocation(newAllocationData);

    const newChartConfig = newAllocationData.reduce((acc, item) => {
      acc[item.name] = { 
        label: item.name,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);
    setChartConfig(newChartConfig);
  };

  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AllocationData; // Explicitly type payload data
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1" style={{ color: data.fill }}>{data.name}</p>
          <p>{`Value: ${currency.symbol}${data.value.toLocaleString()}`}</p>
          <p>{`Percentage: ${data.percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Portfolio Allocation Calculator</CardTitle>
        <CardDescription>Plan your asset allocation strategy by inputting values for different asset classes.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stocks">Stocks Value ({currency.symbol})</Label>
              <Input id="stocks" type="number" step="any" {...form.register('stocks')} />
            </div>
            <div>
              <Label htmlFor="bonds">Bonds Value ({currency.symbol})</Label>
              <Input id="bonds" type="number" step="any" {...form.register('bonds')} />
            </div>
            <div>
              <Label htmlFor="crypto">Crypto Value ({currency.symbol})</Label>
              <Input id="crypto" type="number" step="any" {...form.register('crypto')} />
            </div>
            <div>
              <Label htmlFor="realEstate">Real Estate Value ({currency.symbol})</Label>
              <Input id="realEstate" type="number" step="any" {...form.register('realEstate')} />
            </div>
             <div>
              <Label htmlFor="cash">Cash Value ({currency.symbol})</Label>
              <Input id="cash" type="number" step="any" {...form.register('cash')} />
            </div>
          </div>
           {form.formState.errors.stocks && typeof form.formState.errors.stocks.message === 'string' && <p className="text-sm text-destructive mt-1">{form.formState.errors.stocks.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate Allocation</Button>
        </CardFooter>
      </form>

      {allocation && allocation.length > 0 && chartConfig && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Portfolio Allocation</h3>
          <p className="mb-4"><strong>Total Portfolio Value:</strong> {currency.symbol}{totalValue.toLocaleString()}</p>
          <div className="h-80 md:h-96 mb-6 flex justify-center">
            <ChartContainer config={chartConfig} className="aspect-square max-h-[300px]">
              <PieChart accessibilityLayer>
                <ChartTooltip 
                  content={<CustomPieTooltip />} 
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                />
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage, x, y, fill }) => (
                    <text
                      x={x}
                      y={y}
                      fill={fill} // Use slice color for label, or a contrasting theme color
                      textAnchor={x > (150) ? "start" : "end"} // 150 is approx center of 300px chart
                      dominantBaseline="central"
                      className="text-xs font-medium"
                    >
                      {`${name} (${percentage.toFixed(0)}%)`}
                    </text>
                  )}
                  outerRadius={100}
                  innerRadius={40} // Makes it a Donut chart
                  paddingAngle={2}
                >
                  {allocation.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} name={entry.name} />
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
           <ul className="space-y-1">
            {allocation.map(item => (
              <li key={item.name} className="flex justify-between">
                <span className="flex items-center">
                   <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: item.fill }}></span>
                  {item.name}:
                </span>
                <span>{currency.symbol}{item.value.toLocaleString()} ({item.percentage}%)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
