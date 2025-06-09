
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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const formSchema = z.object({
  stocks: z.coerce.number().min(0, "Value must be non-negative").optional(),
  bonds: z.coerce.number().min(0, "Value must be non-negative").optional(),
  crypto: z.coerce.number().min(0, "Value must be non-negative").optional(),
  realEstate: z.coerce.number().min(0, "Value must be non-negative").optional(),
  cash: z.coerce.number().min(0, "Value must be non-negative").optional(),
}).refine(data => (data.stocks || 0) + (data.bonds || 0) + (data.crypto || 0) + (data.realEstate || 0) + (data.cash || 0) > 0, {
  message: "At least one asset class must have a value greater than 0.",
  path: ["stocks"], // Arbitrary path for general error
});

type FormData = z.infer<typeof formSchema>;

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function PortfolioAllocationCalculator() { 
  const [allocation, setAllocation] = useState<AllocationData[] | null>(null);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { stocks: 5000, bonds: 3000, crypto: 1000, realEstate: 0, cash: 1000 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const assets = [
      { name: 'Stocks', value: data.stocks || 0 },
      { name: 'Bonds', value: data.bonds || 0 },
      { name: 'Crypto', value: data.crypto || 0 },
      { name: 'Real Estate', value: data.realEstate || 0 },
      { name: 'Cash', value: data.cash || 0 },
    ].filter(asset => asset.value > 0);

    const currentTotalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    setTotalValue(currentTotalValue);

    const allocationData: AllocationData[] = assets.map((asset, index) => ({
      ...asset,
      percentage: parseFloat(((asset.value / currentTotalValue) * 100).toFixed(2)),
      fill: COLORS[index % COLORS.length],
    }));
    setAllocation(allocationData);
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

      {allocation && allocation.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Portfolio Allocation</h3>
          <p className="mb-4"><strong>Total Portfolio Value:</strong> {currency.symbol}{totalValue.toLocaleString()}</p>
          <div className="h-80 md:h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: {payload: AllocationData}) => [`${currency.symbol}${value.toLocaleString()} (${props.payload.percentage}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
           <ul className="space-y-1">
            {allocation.map(item => (
              <li key={item.name} className="flex justify-between">
                <span>{item.name}:</span>
                <span>{currency.symbol}{item.value.toLocaleString()} ({item.percentage}%)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
