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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const formSchema = z.object({
  principal: z.coerce.number().min(0.01, "Principal must be greater than 0"),
  rate: z.coerce.number().min(0.01, "Interest rate must be greater than 0").max(100, "Interest rate must be 100 or less"),
  time: z.coerce.number().min(1, "Time must be at least 1 year").max(100, "Time cannot exceed 100 years"),
  compoundingFrequency: z.enum(['1', '2', '4', '12']), // Annually, Semi-Annually, Quarterly, Monthly
});

type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  futureValue: number;
  totalInterest: number;
  annualBreakdown: { year: number; value: number; interestEarned: number }[];
}

export function CompoundInterestCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 10000,
      rate: 7,
      time: 10,
      compoundingFrequency: '12',
    },
  });

  const calculateCompoundInterest = (data: FormData) => {
    const { principal, rate, time, compoundingFrequency } = data;
    const n = parseInt(compoundingFrequency);
    const r = rate / 100;

    const futureValue = principal * Math.pow((1 + r / n), n * time);
    const totalInterest = futureValue - principal;

    const annualBreakdown: CalculationResult['annualBreakdown'] = [];
    let currentPrincipal = principal;
    for (let year = 1; year <= time; year++) {
      const valueAtYearEnd = currentPrincipal * Math.pow((1 + r / n), n * 1);
      const interestEarnedThisYear = valueAtYearEnd - currentPrincipal;
      annualBreakdown.push({
        year,
        value: parseFloat(valueAtYearEnd.toFixed(2)),
        interestEarned: parseFloat(interestEarnedThisYear.toFixed(2)),
      });
      currentPrincipal = valueAtYearEnd;
    }
    
    setResult({
      futureValue: parseFloat(futureValue.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      annualBreakdown,
    });
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    calculateCompoundInterest(data);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Compound Interest Calculator</CardTitle>
        <CardDescription>Calculate the future value of your investment with the power of compounding.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="principal">Principal Amount ($)</Label>
              <Input id="principal" type="number" step="any" {...form.register('principal')} />
              {form.formState.errors.principal && <p className="text-sm text-destructive mt-1">{form.formState.errors.principal.message}</p>}
            </div>
            <div>
              <Label htmlFor="rate">Annual Interest Rate (%)</Label>
              <Input id="rate" type="number" step="any" {...form.register('rate')} />
              {form.formState.errors.rate && <p className="text-sm text-destructive mt-1">{form.formState.errors.rate.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="time">Time Period (Years)</Label>
              <Input id="time" type="number" {...form.register('time')} />
              {form.formState.errors.time && <p className="text-sm text-destructive mt-1">{form.formState.errors.time.message}</p>}
            </div>
            <div>
              <Label htmlFor="compoundingFrequency">Compounding Frequency</Label>
              <Select onValueChange={(value) => form.setValue('compoundingFrequency', value as FormData['compoundingFrequency'])} defaultValue={form.getValues('compoundingFrequency')}>
                <SelectTrigger id="compoundingFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Annually</SelectItem>
                  <SelectItem value="2">Semi-Annually</SelectItem>
                  <SelectItem value="4">Quarterly</SelectItem>
                  <SelectItem value="12">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.compoundingFrequency && <p className="text-sm text-destructive mt-1">{form.formState.errors.compoundingFrequency.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">Calculate</Button>
        </CardFooter>
      </form>

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-lg">
            <p><strong>Future Value:</strong> ${result.futureValue.toLocaleString()}</p>
            <p><strong>Total Interest Earned:</strong> ${result.totalInterest.toLocaleString()}</p>
          </div>

          <div className="mb-8 h-80 md:h-96">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.annualBreakdown} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" unit="yr" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }}/>
                    <Line type="monotone" dataKey="value" name="Investment Value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="interestEarned" name="Interest Earned (Yearly)" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
          </div>
          
          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Interest Earned</TableHead>
                  <TableHead className="text-right">End Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>${item.interestEarned.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${item.value.toLocaleString()}</TableCell>
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
