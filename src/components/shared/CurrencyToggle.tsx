
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Currency {
  value: string;
  label: string;
  symbol: string;
}

export const AVAILABLE_CURRENCIES: Currency[] = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'CHF', label: 'CHF (Fr)', symbol: 'CHF' },
  { value: 'CNY', label: 'CNY (元)', symbol: '元' },
];

interface CurrencyToggleProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  id?: string;
  className?: string;
}

export function CurrencyToggle({ selectedCurrency, onCurrencyChange, id, className }: CurrencyToggleProps) {
  const handleValueChange = (valueString: string) => {
    const newCurrency = AVAILABLE_CURRENCIES.find(c => c.value === valueString);
    if (newCurrency) {
      onCurrencyChange(newCurrency);
    }
  };

  return (
    <Select onValueChange={handleValueChange} value={selectedCurrency.value}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_CURRENCIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
