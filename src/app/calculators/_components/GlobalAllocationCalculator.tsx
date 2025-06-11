
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from "@/components/ui/slider";
import { CurrencyToggle, AVAILABLE_CURRENCIES, type Currency } from '@/components/shared/CurrencyToggle';

const formSchema = z.object({
  northAmerica: z.coerce.number().min(0).max(100).optional().default(0),
  europe: z.coerce.number().min(0).max(100).optional().default(0),
  asiaPacific: z.coerce.number().min(0).max(100).optional().default(0),
  emergingMarkets: z.coerce.number().min(0).max(100).optional().default(0),
  otherRegions: z.coerce.number().min(0).max(100).optional().default(0),
}).refine(data => {
  const total = (data.northAmerica || 0) + (data.europe || 0) + (data.asiaPacific || 0) + (data.emergingMarkets || 0) + (data.otherRegions || 0);
  return total >= 0 && total <= 100; 
}, {
  message: "Total allocation must be between 0% and 100%. Please ensure the sum of allocations is not negative or over 100%.",
  path: ["northAmerica"], 
});

type FormData = z.infer<typeof formSchema>;

interface AllocationItem {
    name: string;
    percentage: number;
}

export function GlobalAllocationCalculator() { 
  const [result, setResult] = useState<AllocationItem[] | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { northAmerica: 60, europe: 20, asiaPacific: 10, emergingMarkets: 10, otherRegions: 0 },
  });

  const calculateTotalPercentage = () => {
    const values = form.getValues();
    const currentTotal = (values.northAmerica || 0) + (values.europe || 0) + (values.asiaPacific || 0) + (values.emergingMarkets || 0) + (values.otherRegions || 0);
    setTotalPercentage(currentTotal);
  };
  
  React.useEffect(() => {
    const subscription = form.watch(() => calculateTotalPercentage());
    calculateTotalPercentage(); // Initial calculation
    return () => subscription.unsubscribe();
  }, [form.watch]);


  const onSubmit: SubmitHandler<FormData> = (data) => {
    const allocations: AllocationItem[] = [
        { name: "North America", percentage: data.northAmerica || 0},
        { name: "Europe", percentage: data.europe || 0 },
        { name: "Asia-Pacific", percentage: data.asiaPacific || 0 },
        { name: "Emerging Markets", percentage: data.emergingMarkets || 0 },
        { name: "Other Regions", percentage: data.otherRegions || 0 },
    ].filter(item => item.percentage >= 0); // Keep items with 0% if explicitly set

    const currentTotal = allocations.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(currentTotal);
    
    if (currentTotal > 100) {
        form.setError("northAmerica", {type: "manual", message: "Total allocation cannot exceed 100%."});
        setResult(null); // Clear previous valid results
        return;
    }
     if (currentTotal < 0) { // Should be caught by Zod min(0) but good to have
        form.setError("northAmerica", {type: "manual", message: "Allocations cannot be negative."});
        setResult(null);
        return;
    }
    
    setResult(allocations.filter(item => item.percentage > 0)); // Only show non-zero allocations in result list
  };
  
  const renderAllocationField = (name: keyof FormData, label: string) => (
    <div>
      <Label htmlFor={name}>{label} (%)</Label>
      <div className="flex items-center gap-4 mt-1">
        <Input id={name} type="number" {...form.register(name)} className="w-[100px]" />
        <Controller
          name={name}
          control={form.control}
          render={({ field }) => (
            <Slider
              min={0}
              max={100}
              step={1}
              value={[field.value ?? 0]}
              onValueChange={(value) => {
                field.onChange(value[0]);
                calculateTotalPercentage();
              }}
              className="flex-1"
            />
          )}
        />
      </div>
      {form.formState.errors[name] && <p className="text-sm text-destructive mt-1">{form.formState.errors[name]?.message}</p>}
    </div>
  );


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Global Allocation Calculator</CardTitle>
        <CardDescription>Plan your international investment allocation by percentage. Current total: {totalPercentage.toFixed(0)}%</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderAllocationField("northAmerica", "North America")}
            {renderAllocationField("europe", "Europe")}
            {renderAllocationField("asiaPacific", "Asia-Pacific")}
            {renderAllocationField("emergingMarkets", "Emerging Markets")}
            {renderAllocationField("otherRegions", "Other Regions")}
          </div>
            {form.formState.errors.northAmerica && form.formState.errors.northAmerica.message?.includes("Total allocation") && <p className="text-sm text-destructive mt-1">{form.formState.errors.northAmerica.message}</p>}
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

      {result && result.length > 0 && totalPercentage <= 100 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Global Allocation Breakdown</h3>
          <p className="mb-2"><strong>Total Allocated:</strong> {totalPercentage.toLocaleString()}%</p>
          {totalPercentage < 100 && <p className="text-sm text-amber-600 mb-2">Note: Total allocation is less than 100%. {(100-totalPercentage).toLocaleString()}% is unallocated.</p>}
          
          <ul className="space-y-1">
            {result.map(item => (
              <li key={item.name} className="flex justify-between">
                <span>{item.name}:</span>
                <span>{item.percentage.toLocaleString()}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result === null && totalPercentage > 100 && (
         <div className="p-6 border-t">
            <p className="text-destructive">Total allocation ({totalPercentage}%) exceeds 100%. Please adjust values.</p>
         </div>
      )}
    </Card>
  );
}
