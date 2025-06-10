
'use client';

import { useState, useMemo } from 'react';
import CalculatorCard from '@/components/shared/CalculatorCard';
import { CALCULATORS_DATA, CALCULATOR_CATEGORIES, type CalculatorFeature } from '@/lib/calculator-definitions';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function CalculatorsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCalculators = useMemo(() => {
    if (!searchTerm) {
      return CALCULATORS_DATA;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return CALCULATORS_DATA.filter(calculator =>
      calculator.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      calculator.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      calculator.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [searchTerm]);

  const calculatorsByCategory = useMemo(() => {
    const grouped: { [key: string]: CalculatorFeature[] } = {};
    filteredCalculators.forEach(calculator => {
      if (!grouped[calculator.category]) {
        grouped[calculator.category] = [];
      }
      grouped[calculator.category].push(calculator);
    });
    return grouped;
  }, [filteredCalculators]);

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-headline">Investment Calculators</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Empower your financial journey with our comprehensive suite of AI-enhanced calculation tools.
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search calculators (e.g., 'compound interest', 'crypto', 'roi')..."
            className="w-full pl-10 pr-4 py-2 text-lg h-11 rounded-lg shadow-md focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search calculators"
          />
        </div>
      </header>

      {Object.keys(calculatorsByCategory).length === 0 && searchTerm && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No calculators found matching your search term "{searchTerm}".</p>
          <p className="text-md text-muted-foreground mt-2">Try a different keyword or clear the search.</p>
        </div>
      )}

      {CALCULATOR_CATEGORIES.map((category) => {
        const categoryCalculators = calculatorsByCategory[category];
        if (!categoryCalculators || categoryCalculators.length === 0) return null;

        return (
          <section key={category} className="mb-16">
            <h2 className="text-2xl font-semibold mb-2 font-headline text-primary">{category}</h2>
            <Separator className="mb-8 bg-primary/20" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryCalculators.map((calculator: CalculatorFeature) => (
                <CalculatorCard key={calculator.id} calculator={calculator} />
              ))}
            </div>
          </section>
        );
      })}
       {Object.keys(calculatorsByCategory).length > 0 && filteredCalculators.length < CALCULATORS_DATA.length && searchTerm && (
         <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">Showing {filteredCalculators.length} of {CALCULATORS_DATA.length} calculators.</p>
         </div>
       )}
    </div>
  );
}
