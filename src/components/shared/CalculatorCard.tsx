import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CalculatorFeature } from '@/lib/calculator-definitions';
import { ArrowRight } from 'lucide-react';

interface CalculatorCardProps {
  calculator: CalculatorFeature;
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <calculator.icon className="h-10 w-10 text-primary" />
        <div>
          <CardTitle className="font-headline text-lg">{calculator.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{calculator.description}</CardDescription>
      </CardContent>
      <div className="p-6 pt-0 mt-auto">
        <Button asChild variant="outline" className="w-full">
          <Link href={calculator.path}>
            Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
