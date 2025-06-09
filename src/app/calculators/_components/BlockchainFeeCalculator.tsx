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

const formSchema = z.object({
  gasUnits: z.coerce.number().min(1, "Gas units must be at least 1"),
  gasPrice: z.coerce.number().min(0.000000001, "Gas price must be positive"), // e.g., Gwei for Ethereum
  network: z.enum(['ethereum', 'bitcoin', 'polygon', 'solana']), // Example networks
});
type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  estimatedFee: number; // In native currency of the network (e.g., ETH, BTC)
  estimatedFeeFiat: number; // In selected display currency
}

// Placeholder conversion rates (network native token to USD)
const NETWORK_TO_USD_RATES: Record<string, number> = {
  ethereum: 2000,  // 1 ETH = 2000 USD
  bitcoin: 30000, // 1 BTC = 30000 USD (for transaction fee context if applicable)
  polygon: 0.8,   // 1 MATIC = 0.8 USD
  solana: 20,     // 1 SOL = 20 USD
};
const NETWORK_CURRENCY_SYMBOL: Record<string, string> = {
  ethereum: 'ETH',
  bitcoin: 'BTC', 
  polygon: 'MATIC',
  solana: 'SOL',
};


export function BlockchainFeeCalculator() { 
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currency, setCurrency] = useState<Currency>(AVAILABLE_CURRENCIES.find(c => c.value === 'USD') || AVAILABLE_CURRENCIES[0]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { gasUnits: 21000, gasPrice: 20, network: 'ethereum' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Simplified fee calculation. Real fees are complex and dynamic.
    // Bitcoin fees work differently (sat/vB). This is a generic placeholder.
    let feeInNativeToken = 0;
    if (data.network === 'ethereum' || data.network === 'polygon') {
      feeInNativeToken = (data.gasUnits * data.gasPrice) / 1_000_000_000; // Gwei to ETH/MATIC
    } else if (data.network === 'solana') {
      feeInNativeToken = (data.gasUnits * data.gasPrice) / 1_000_000_000; // Lamports to SOL (assuming gasPrice in lamports/CU)
    } else { // Bitcoin placeholder
      feeInNativeToken = (data.gasUnits * data.gasPrice) / 100_000_000; // Assuming gasUnits = vBytes, gasPrice = satoshis/vByte
    }
    
    const networkRate = NETWORK_TO_USD_RATES[data.network] || 1;
    const estimatedFeeInUsd = feeInNativeToken * networkRate;

    // Convert USD to selected display currency (very rough, no real-time rates)
    const usdToSelectedCurrencyRate = currency.value === 'USD' ? 1 : (1 / (AVAILABLE_CURRENCIES.find(c=>c.value === 'USD')?.value === currency.value ? 1 : (currency.symbol === '€' ? 1.1 : (currency.symbol === '£' ? 1.2 : 0.012 ) ) ) ); // Mock
    const estimatedFeeFiat = estimatedFeeInUsd * usdToSelectedCurrencyRate;


    setResult({ 
        estimatedFee: parseFloat(feeInNativeToken.toFixed(8)),
        estimatedFeeFiat: parseFloat(estimatedFeeFiat.toFixed(2)),
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Blockchain Fee Calculator</CardTitle>
        <CardDescription>Estimate blockchain transaction fees. (Highly Simplified)</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="network">Blockchain Network</Label>
            <Select onValueChange={(value) => form.setValue('network', value as FormData['network'])} defaultValue={form.getValues('network')}>
              <SelectTrigger id="network"><SelectValue placeholder="Select network" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum (Gas Price in Gwei)</SelectItem>
                <SelectItem value="bitcoin">Bitcoin (Gas Price in sats/vB, Gas Units as vBytes)</SelectItem>
                <SelectItem value="polygon">Polygon (Gas Price in Gwei)</SelectItem>
                <SelectItem value="solana">Solana (Gas Price in lamports/CU)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gasUnits">Gas Units / vBytes / Compute Units</Label>
            <Input id="gasUnits" type="number" {...form.register('gasUnits')} />
            {form.formState.errors.gasUnits && <p className="text-sm text-destructive mt-1">{form.formState.errors.gasUnits.message}</p>}
          </div>
          <div>
            <Label htmlFor="gasPrice">Gas Price (Gwei / sats/vB / lamports/CU)</Label>
            <Input id="gasPrice" type="number" step="any" {...form.register('gasPrice')} />
            {form.formState.errors.gasPrice && <p className="text-sm text-destructive mt-1">{form.formState.errors.gasPrice.message}</p>}
          </div>
          <div>
            <Label htmlFor="currency-toggle">Display Fiat Currency</Label>
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

      {result && (
        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4 font-headline">Results (Simplified Estimate)</h3>
          <p><strong>Estimated Fee (Native Token):</strong> {result.estimatedFee.toLocaleString()} {NETWORK_CURRENCY_SYMBOL[form.getValues("network")]}</p>
          <p><strong>Estimated Fee (Fiat):</strong> {currency.symbol}{result.estimatedFeeFiat.toLocaleString()}</p>
        </div>
      )}
    </Card>
  );
}
