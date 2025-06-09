import CalculatorCard from '@/components/shared/CalculatorCard';
import { CALCULATORS_DATA, CALCULATOR_CATEGORIES, CalculatorFeature } from '@/lib/calculator-definitions';
import { Separator } from '@/components/ui/separator';

export default function CalculatorsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-4 font-headline">Investment Calculators</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Empower your financial journey with our comprehensive suite of AI-enhanced calculation tools.
      </p>

      {CALCULATOR_CATEGORIES.map((category) => {
        const categoryCalculators = CALCULATORS_DATA.filter(calc => calc.category === category);
        if (categoryCalculators.length === 0) return null;

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
    </div>
  );
}
