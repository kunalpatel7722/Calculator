
'use client';

import React, { useState, useEffect } from 'react';
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
  northAmerica: z.coerce.number().min(0, "Allocation must be non-negative.").max(100).optional().default(0),
  europe: z.coerce.number().min(0, "Allocation must be non-negative.").max(100).optional().default(0),
  asiaPacific: z.coerce.number().min(0, "Allocation must be non-negative.").max(100).optional().default(0),
  emergingMarkets: z.coerce.number().min(0, "Allocation must be non-negative.").max(100).optional().default(0),
  otherRegions: z.coerce.number().min(0, "Allocation must be non-negative.").max(100).optional().default(0),
}).refine(data => {
  const total = (data.northAmerica || 0) + (data.europe || 0) + (data.asiaPacific || 0) + (data.emergingMarkets || 0) + (data.otherRegions || 0);
  return total <= 100; 
}, {
  message: "Total allocation cannot exceed 100%.",
  path: ["northAmerica"], 
});

type FormData = z.infer<typeof formSchema>;

interface AllocationItem {
    name: string;
    percentage: number;
    fill: string; // Added for chart
}

const REGION_COLORS: Record<string, string> = {
    "North America": "hsl(var(--chart-1))",
    "Europe": "hsl(var(--chart-2))",
    "Asia-Pacific": "hsl(var(--chart-3))",
    "Emerging Markets": "hsl(var(--chart-4))",
    "Other Regions": "hsl(var(--chart-5))",
};

export function GlobalAllocationCalculator() { 
  const [result, setResult] = useState<AllocationItem[] | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { northAmerica: 60, europe: 20, asiaPacific: 10, emergingMarkets: 10, otherRegions: 0 },
  });
  
  const { watch, getValues, formState: { errors } } = form;

  useEffect(() => {
    const calculateAndSetTotalPercentage = (values: Partial<FormData>) => {
      const currentTotal = 
        (values.northAmerica || 0) + 
        (values.europe || 0) + 
        (values.asiaPacific || 0) + 
        (values.emergingMarkets || 0) + 
        (values.otherRegions || 0);
      setTotalPercentage(currentTotal);
    };
    
    const subscription = watch((values) => {
      calculateAndSetTotalPercentage(values as FormData);
    });
    
    calculateAndSetTotalPercentage(getValues());
    
    return () => subscription.unsubscribe();
  }, [watch, getValues, setTotalPercentage]);


  const onSubmit: SubmitHandler<FormData> = (data) => {
    const allocationsRaw = [
        { name: "North America", percentage: data.northAmerica || 0},
        { name: "Europe", percentage: data.europe || 0 },
        { name: "Asia-Pacific", percentage: data.asiaPacific || 0 },
        { name: "Emerging Markets", percentage: data.emergingMarkets || 0 },
        { name: "Other Regions", percentage: data.otherRegions || 0 },
    ];

    const currentTotal = allocationsRaw.reduce((sum, item) => sum + item.percentage, 0);
    setTotalPercentage(currentTotal); 

    const allocationsWithColors: AllocationItem[] = allocationsRaw
        .filter(item => item.percentage > 0)
        .map(item => ({
            ...item,
            fill: REGION_COLORS[item.name] || "hsl(var(--muted))",
        }));
    
    setResult(allocationsWithColors);

    const newChartConfig = allocationsWithColors.reduce((acc, item) => {
      acc[item.name] = { 
        label: item.name,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);
    setChartConfig(newChartConfig);
  };
  
  const renderAllocationField = (name: keyof FormData, label: string) => (
    <div>
      <Label htmlFor={name}>{label} (%)</Label>
      <Input id={name} type="number" {...form.register(name)} className="mt-1" />
      {errors[name] && <p className="text-sm text-destructive mt-1">{errors[name]?.message}</p>}
    </div>
  );

  interface CustomPieTooltipProps extends TooltipProps<number, string> {}

  const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AllocationItem; 
      return (
        <div className="p-2 text-sm bg-background/90 border border-border rounded-md shadow-lg">
          <p className="font-bold mb-1" style={{ color: data.fill }}>{data.name}</p>
          <p>{`Percentage: ${data.percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

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
            {errors.northAmerica && errors.northAmerica.message?.includes("Total allocation") && <p className="text-sm text-destructive mt-1">{errors.northAmerica.message}</p>}
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

      {result && result.length > 0 && totalPercentage <= 100 && chartConfig && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Global Allocation Breakdown</h3>
          <p className="mb-2"><strong>Total Allocated:</strong> {totalPercentage.toLocaleString()}%</p>
          {totalPercentage < 100 && <p className="text-sm text-amber-600 mb-2">Note: Total allocation is less than 100%. {(100-totalPercentage).toLocaleString()}% is unallocated.</p>}
          
          <div className="my-8 h-80 md:h-96 flex justify-center">
            <ChartContainer config={chartConfig} className="aspect-square max-h-[300px] sm:max-h-[350px]">
              <PieChart>
                <ChartTooltip 
                  content={<CustomPieTooltip />}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                />
                <Pie
                  data={result}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                >
                  {result.map((entry, index) => (
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

          <ul className="space-y-1 mt-6">
            {result.map(item => (
              <li key={item.name} className="flex justify-between">
                <span className="flex items-center">
                   <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: item.fill }}></span>
                   {item.name}:
                </span>
                <span>{item.percentage.toLocaleString()}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
