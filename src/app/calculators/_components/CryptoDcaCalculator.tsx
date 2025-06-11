
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { TooltipPayload } from 'recharts';

const formSchema = z.object({
  periodicInvestment: z.coerce.number().min(1, "Periodic investment amount must be at least 1"),
  investmentFrequency: z.enum(['monthly', 'quarterly', 'annually']).default('monthly'),
  investmentPeriodYears: z.coerce.number().int().min(1, "Investment period must be at least 1 year").max(50),
  averagePrice: z.coerce.number().min(0.000001, "Estimated average crypto price must be greater than 0"),
  expectedAnnualReturn: z.coerce.number().min(0, "Expected annual return rate must be non-negative").max(100).optional().default(0),
});
type FormData = z.infer<typeof formSchema>;

interface AnnualDcaDataPoint {
  year: number;
  totalInvested: number; // Cumulative amount invested
  totalCryptoAcquired: number; // Cumulative crypto acquired
  portfolioValue: number; // Market value of acquired crypto at year end, considering growth
}

interface CalculationResult {
  finalTotalInvested: number;
  finalTotalCryptoAcquired: number;
  finalAverageCostPerUnit: number;
  finalPortfolioValue: number;
  annualBreakdown: AnnualDcaDataPoint[];
}

export function CryptoDcaCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { periodicInvestment: 100, investmentFrequency: 'monthly', investmentPeriodYears: 5, averagePrice: 30000, expectedAnnualReturn: 5 },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const { periodicInvestment, investmentFrequency, investmentPeriodYears, averagePrice, expectedAnnualReturn } = data;
    
    let periodsPerYear = 12;
    if (investmentFrequency === 'quarterly') periodsPerYear = 4;
    if (investmentFrequency === 'annually') periodsPerYear = 1;

    const annualReturnRateDecimal = (expectedAnnualReturn || 0) / 100;
    // Calculate effective periodic rate for asset growth if annual rate is provided
    const periodicAssetGrowthRate = periodsPerYear > 0 && annualReturnRateDecimal > 0 
      ? Math.pow(1 + annualReturnRateDecimal, 1 / periodsPerYear) - 1
      : 0;

    const annualBreakdown: AnnualDcaDataPoint[] = [];
    let cumulativeInvested = 0;
    let cumulativeCrypto = 0;
    let portfolioMarketValue = 0; 

    for (let year = 1; year <= investmentPeriodYears; year++) {
      for (let p = 1; p <= periodsPerYear; p++) {
        // 1. Grow existing crypto holdings' market value for one period
        portfolioMarketValue *= (1 + periodicAssetGrowthRate);

        // 2. Make new investment and acquire crypto
        cumulativeInvested += periodicInvestment;
        const cryptoBoughtThisPeriod = periodicInvestment / averagePrice; // Crypto bought at fixed 'averagePrice'
        cumulativeCrypto += cryptoBoughtThisPeriod;

        // 3. Add the cost value of newly bought crypto to portfolioMarketValue
        // This newly bought crypto will start appreciating from the next period
        portfolioMarketValue += cryptoBoughtThisPeriod * averagePrice;
      }

      annualBreakdown.push({
        year,
        totalInvested: parseFloat(cumulativeInvested.toFixed(2)),
        totalCryptoAcquired: parseFloat(cumulativeCrypto.toFixed(8)),
        portfolioValue: parseFloat(portfolioMarketValue.toFixed(2)),
      });
    }
    
    const finalTotalInvested = cumulativeInvested;
    const finalTotalCryptoAcquired = cumulativeCrypto;
    const finalAverageCostPerUnit = finalTotalInvested > 0 && finalTotalCryptoAcquired > 0 ? finalTotalInvested / finalTotalCryptoAcquired : 0;
    const finalPortfolioValue = annualBreakdown.length > 0 ? annualBreakdown[annualBreakdown.length - 1].portfolioValue : 0;

    setResult({ 
        finalTotalInvested: parseFloat(finalTotalInvested.toFixed(2)),
        finalTotalCryptoAcquired: parseFloat(finalTotalCryptoAcquired.toFixed(8)),
        finalAverageCostPerUnit: parseFloat(finalAverageCostPerUnit.toFixed(2)),
        finalPortfolioValue: parseFloat(finalPortfolioValue.toFixed(2)),
        annualBreakdown,
    });
  };

  const chartConfig = {
    portfolioValue: {
      label: `Portfolio Value (${currency.symbol})`,
      color: "hsl(var(--chart-1))",
    },
    totalInvested: {
      label: `Total Invested (${currency.symbol})`,
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
                {`Crypto Acquired: ${yearData.totalCryptoAcquired.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})} units`}
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
        <CardTitle className="font-headline text-2xl">Crypto DCA Calculator</CardTitle>
        <CardDescription>Simulate Dollar Cost Averaging for crypto investments with annual growth projection.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="periodicInvestment">Periodic Investment Amount ({currency.symbol})</Label>
              <Input id="periodicInvestment" type="number" step="any" {...form.register('periodicInvestment')} />
              {form.formState.errors.periodicInvestment && <p className="text-sm text-destructive mt-1">{form.formState.errors.periodicInvestment.message}</p>}
            </div>
            <div>
              <Label htmlFor="investmentFrequency">Investment Frequency</Label>
              <Select onValueChange={(value) => form.setValue('investmentFrequency', value as FormData['investmentFrequency'])} defaultValue={form.getValues('investmentFrequency')}>
                  <SelectTrigger id="investmentFrequency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="investmentPeriodYears">Investment Period (Years)</Label>
              <Input id="investmentPeriodYears" type="number" {...form.register('investmentPeriodYears')} />
              {form.formState.errors.investmentPeriodYears && <p className="text-sm text-destructive mt-1">{form.formState.errors.investmentPeriodYears.message}</p>}
            </div>
            <div>
              <Label htmlFor="averagePrice">Assumed Crypto Purchase Price ({currency.symbol})</Label>
              <Input id="averagePrice" type="number" step="any" {...form.register('averagePrice')} />
              {form.formState.errors.averagePrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.averagePrice.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="expectedAnnualReturn">Expected Annual Crypto Return (%) (Optional)</Label>
            <Input id="expectedAnnualReturn" type="number" step="any" {...form.register('expectedAnnualReturn')} placeholder="e.g., 5 for 5%"/>
            {form.formState.errors.expectedAnnualReturn && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedAnnualReturn.message}</p>}
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
          <Button type="submit" className="w-full md:w-auto">Calculate DCA</Button>
        </CardFooter>
      </form>

      {result && result.annualBreakdown.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results</h3>
          <p><strong>Final Total Invested:</strong> {currency.symbol}{result.finalTotalInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p><strong>Final Total Crypto Acquired:</strong> {result.finalTotalCryptoAcquired.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})} units</p>
          <p><strong>Final Average Cost per Unit:</strong> {currency.symbol}{result.finalAverageCostPerUnit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="mb-6"><strong>Estimated Final Portfolio Value:</strong> {currency.symbol}{result.finalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          
          <div className="my-8 h-80 md:h-96">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart accessibilityLayer data={result.annualBreakdown} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="year" unit="yr" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(val) => `${currency.symbol}${val.toLocaleString()}`} 
                    />
                    <ChartTooltip content={<CustomTooltip />} cursorStyle={{strokeDasharray: '3 3', strokeWidth: 1.5, fillOpacity: 0.1}}/>
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="portfolioValue" type="monotone" name={chartConfig.portfolioValue.label} stroke={chartConfig.portfolioValue.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                    <Line dataKey="totalInvested" type="monotone" name={chartConfig.totalInvested.label} stroke={chartConfig.totalInvested.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
          </div>

          <h4 className="text-lg font-semibold mb-2 font-headline">Annual Breakdown</h4>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Invested</TableHead>
                  <TableHead>Total Crypto Acquired</TableHead>
                  <TableHead className="text-right">Portfolio Market Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.annualBreakdown.map((item) => (
                  <TableRow key={item.year}>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>{currency.symbol}{item.totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{item.totalCryptoAcquired.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})} units</TableCell>
                    <TableCell className="text-right">{currency.symbol}{item.portfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <p className="text-xs mt-2 text-muted-foreground">Note: Assumes a constant crypto purchase price and periodic compounding of returns on the crypto's market value.</p>
        </div>
      )}
    </Card>
  );
}


    