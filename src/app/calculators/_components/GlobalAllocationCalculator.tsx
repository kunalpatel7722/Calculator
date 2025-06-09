
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
// For a real version, a Pie chart would be good here like PortfolioAllocationCalculator

const formSchema = z.object({
  // Example regions, more can be added
  northAmerica: z.coerce.number().min(0).max(100).optional().default(0),
  europe: z.coerce.number().min(0).max(100).optional().default(0),
  asiaPacific: z.coerce.number().min(0).max(100).optional().default(0),
  emergingMarkets: z.coerce.number().min(0).max(100).optional().default(0),
  otherRegions: z.coerce.number().min(0).max(100).optional().default(0),
}).refine(data => {
  const total = (data.northAmerica || 0) + (data.europe || 0) + (data.asiaPacific || 0) + (data.emergingMarkets || 0) + (data.otherRegions || 0);
  return total > 0 && total <= 100; // Allow total less than 100 if user is still inputting, but must be > 0. Final check could be for == 100.
}, {
  message: "Total allocation must be between 1% and 100%.",
  path: ["northAmerica"], // Arbitrary path
});

type FormData = z.infer<typeof formSchema>;

interface AllocationItem {
    name: string;
    percentage: number;
}

export function GlobalAllocationCalculator() { 
  const [result, setResult] = useState<AllocationItem[] | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  // Currency toggle might not be directly applicable for percentages, but can be kept for context or future value inputs
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { northAmerica: 60, europe: 20, asiaPacific: 10, emergingMarkets: 10, otherRegions: 0 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const allocations: AllocationItem[] = [
        { name: "North America", percentage: data.northAmerica || 0},
        { name: "Europe", percentage: data.europe || 0 },
        { name: "Asia-Pacific", percentage: data.asiaPacific || 0 },
        { name: "Emerging Markets", percentage: data.emergingMarkets || 0 },
        { name: "Other Regions", percentage: data.otherRegions || 0 },
    ].filter(item => item.percentage > 0);

    const currentTotal = allocations.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(currentTotal);

    if (currentTotal > 100) {
        form.setError("northAmerica", {type: "manual", message: "Total allocation cannot exceed 100%."});
        setResult(null);
        return;
    }
    if (currentTotal === 0) {
        form.setError("northAmerica", {type: "manual", message: "At least one region must have an allocation."});
        setResult(null);
        return;
    }
    
    setResult(allocations);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Global Allocation Calculator</CardTitle>
        <CardDescription>Plan your international investment allocation by percentage.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="northAmerica">North America (%)</Label>
              <Input id="northAmerica" type="number" {...form.register('northAmerica')} />
            </div>
            <div>
              <Label htmlFor="europe">Europe (%)</Label>
              <Input id="europe" type="number" {...form.register('europe')} />
            </div>
            <div>
              <Label htmlFor="asiaPacific">Asia-Pacific (%)</Label>
              <Input id="asiaPacific" type="number" {...form.register('asiaPacific')} />
            </div>
            <div>
              <Label htmlFor="emergingMarkets">Emerging Markets (%)</Label>
              <Input id="emergingMarkets" type="number" {...form.register('emergingMarkets')} />
            </div>
            <div>
              <Label htmlFor="otherRegions">Other Regions (%)</Label>
              <Input id="otherRegions" type="number" {...form.register('otherRegions')} />
            </div>
          </div>
            {form.formState.errors.northAmerica && <p className="text-sm text-destructive mt-1">{form.formState.errors.northAmerica.message}</p>}
          <div>
            <Label htmlFor="currency-toggle">Reference Currency (for context)</Label>
            <CurrencyToggle
              id="currency-toggle"
              selectedCurrency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">View Allocation</Button>
        </CardFooter>
      </form>

      {result && result.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Global Allocation Breakdown</h3>
          <p className="mb-2"><strong>Total Allocated:</strong> {totalPercentage.toLocaleString()}%</p>
          {totalPercentage < 100 && <p className="text-sm text-amber-600 mb-2">Note: Total allocation is less than 100%. {100-totalPercentage}% is unallocated.</p>}
          {totalPercentage > 100 && <p className="text-sm text-destructive mb-2">Error: Total allocation exceeds 100%.</p>}
          <ul className="space-y-1">
            {result.map(item => (
              <li key={item.name} className="flex justify-between">
                <span>{item.name}:</span>
                <span>{item.percentage.toLocaleString()}%</span>
              </li>
            ))}
          </ul>
          {/* Pie chart could be added here */}
        </div>
      )}
    </Card>
  );
}
