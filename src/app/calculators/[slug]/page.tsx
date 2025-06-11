
import { getCalculatorById, CALCULATORS_DATA, type CalculatorFeature } from '@/lib/calculator-definitions';
import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Construction } from 'lucide-react';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Loading skeleton for calculator components
const CalculatorLoadingSkeleton = () => (
  <Card className="shadow-lg">
    <CardHeader><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><Skeleton className="h-4 w-1/3 mb-2" /><Skeleton className="h-10 w-full" /></div>
        <div><Skeleton className="h-4 w-1/3 mb-2" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div><Skeleton className="h-4 w-1/3 mb-2" /><Skeleton className="h-10 w-full" /></div>
      <div><Skeleton className="h-4 w-1/3 mb-2" /><Skeleton className="h-10 w-1/2" /></div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-32" />
    </CardFooter>
  </Card>
);

// Dynamically import all calculator components
const calculatorComponents: Record<string, React.ComponentType<any>> = {
  'compound-interest': dynamic(() => import('@/app/calculators/_components/CompoundInterestCalculator').then(mod => mod.CompoundInterestCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'stock-return': dynamic(() => import('@/app/calculators/_components/StockReturnCalculator').then(mod => mod.StockReturnCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'dividend-yield': dynamic(() => import('@/app/calculators/_components/DividendYieldCalculator').then(mod => mod.DividendYieldCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'risk-reward-ratio': dynamic(() => import('@/app/calculators/_components/RiskRewardRatioCalculator').then(mod => mod.RiskRewardRatioCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'volatility': dynamic(() => import('@/app/calculators/_components/VolatilityCalculator').then(mod => mod.VolatilityCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'bitcoin-roi': dynamic(() => import('@/app/calculators/_components/BitcoinRoiCalculator').then(mod => mod.BitcoinRoiCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'crypto-dca': dynamic(() => import('@/app/calculators/_components/CryptoDcaCalculator').then(mod => mod.CryptoDcaCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'blockchain-fee': dynamic(() => import('@/app/calculators/_components/BlockchainFeeCalculator').then(mod => mod.BlockchainFeeCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'crypto-tax': dynamic(() => import('@/app/calculators/_components/CryptoTaxCalculator').then(mod => mod.CryptoTaxCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'ico-ido-roi': dynamic(() => import('@/app/calculators/_components/IcoIdoRoiCalculator').then(mod => mod.IcoIdoRoiCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'portfolio-allocation': dynamic(() => import('@/app/calculators/_components/PortfolioAllocationCalculator').then(mod => mod.PortfolioAllocationCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'loan-vs-investment': dynamic(() => import('@/app/calculators/_components/LoanVsInvestmentCalculator').then(mod => mod.LoanVsInvestmentCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'real-estate-roi': dynamic(() => import('@/app/calculators/_components/RealEstateRoiCalculator').then(mod => mod.RealEstateRoiCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'goal-planning': dynamic(() => import('@/app/calculators/_components/GoalPlanningCalculator').then(mod => mod.GoalPlanningCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'time-value-of-money': dynamic(() => import('@/app/calculators/_components/TimeValueOfMoneyCalculator').then(mod => mod.TimeValueOfMoneyCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'sip-calculator': dynamic(() => import('@/app/calculators/_components/SipCalculator').then(mod => mod.SipCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'sip-vs-lumpsum': dynamic(() => import('@/app/calculators/_components/SipVsLumpsumCalculator').then(mod => mod.SipVsLumpsumCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'swp-calculator': dynamic(() => import('@/app/calculators/_components/SwpCalculator').then(mod => mod.SwpCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'elss-tax-saving': dynamic(() => import('@/app/calculators/_components/ElssTaxSavingCalculator').then(mod => mod.ElssTaxSavingCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'retirement-corpus': dynamic(() => import('@/app/calculators/_components/RetirementCorpusCalculator').then(mod => mod.RetirementCorpusCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'annuity-calculator': dynamic(() => import('@/app/calculators/_components/AnnuityCalculator').then(mod => mod.AnnuityCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'bear-market-survival': dynamic(() => import('@/app/calculators/_components/BearMarketSurvivalCalculator').then(mod => mod.BearMarketSurvivalCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'global-allocation': dynamic(() => import('@/app/calculators/_components/GlobalAllocationCalculator').then(mod => mod.GlobalAllocationCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'market-timing-cost': dynamic(() => import('@/app/calculators/_components/MarketTimingCostCalculator').then(mod => mod.MarketTimingCostCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
  'currency-converter': dynamic(() => import('@/app/calculators/_components/CurrencyConverterCalculator').then(mod => mod.CurrencyConverterCalculator), { loading: () => <CalculatorLoadingSkeleton /> }),
};


export async function generateStaticParams() {
  return CALCULATORS_DATA.map((calculator) => ({
    slug: calculator.id,
  }));
}

interface CalculatorPageProps {
  params: { slug: string };
}

const getCalculatorComponent = (slug: string) => {
  return calculatorComponents[slug] || null;
};

async function SeoAsideContent({ calculatorInfo, isCalculatorImplemented }: { calculatorInfo: CalculatorFeature, isCalculatorImplemented: boolean }) {
  let seoContent = { title: calculatorInfo.name, content: calculatorInfo.description };
  if (isCalculatorImplemented) {
    try {
      seoContent = await generateSeoContent({
        calculatorName: calculatorInfo.name,
        keywords: calculatorInfo.keywords.join(', '),
      });
    } catch (error: any) {
      const itemName = calculatorInfo.name;
      let errorDetailsText = "Unknown error occurred.";

      if (error instanceof Error) {
        errorDetailsText = `Message: ${error.message}`;
        console.error(`Failed to generate SEO content for "${itemName}". ${errorDetailsText}`);
        if (error.stack) {
          console.error("Stack trace for the above error:", error.stack);
        }
      } else if (error && typeof error === 'object') {
        if (error.message) {
          errorDetailsText = `Message: ${error.message}`;
        } else {
          try {
            errorDetailsText = `Object: ${JSON.stringify(error, null, 2)}`;
          } catch (stringifyError) {
            errorDetailsText = `Unstringifiable Object. Keys: ${Object.keys(error).join(', ')}`;
          }
        }
        console.error(`Failed to generate SEO content for "${itemName}". ${errorDetailsText}`);
        console.error("Raw error object details:", error);
      } else {
        errorDetailsText = `Details: ${String(error)}`;
        console.error(`Failed to generate SEO content for "${itemName}". ${errorDetailsText}`);
      }
      seoContent.title = calculatorInfo.name;
      seoContent.content = `Learn more about the ${calculatorInfo.name}. ${calculatorInfo.description}`;
    }
  }

  const formattedSeoContent = seoContent.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(?:\n|<br \/>)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(?:\n|<br \/>)/g, '<h2>$1</h2>')
    .replace(/# (.*?)(?:\n|<br \/>)/g, '<h1>$1</h1>')
    .replace(/^- (.*?)(?:\n|<br \/>)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n/g, '<br />');

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">{seoContent.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: formattedSeoContent }} />
        </CardContent>
      </Card>

      {isCalculatorImplemented && (
         <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">How it Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>This section explains the principles and formulas behind the {calculatorInfo.name}. For detailed information, refer to the AI-generated content above or financial education resources. The specific logic for this calculator is a placeholder.</p>
            </CardContent>
          </Card>
      )}
    </>
  );
}

function SeoAsideFallback() {
  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </>
  );
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = params;
  const calculatorInfo = getCalculatorById(slug);

  if (!calculatorInfo) {
    return <div className="container mx-auto py-8 text-center">Calculator not found.</div>;
  }

  const CalculatorComponent = getCalculatorComponent(slug);

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 text-center">
        <calculatorInfo.icon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-3 font-headline">{calculatorInfo.name}</h1>
        <p className="text-lg text-muted-foreground">{calculatorInfo.description}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {CalculatorComponent ? (
            <CalculatorComponent />
          ) : (
            <Card className="shadow-lg text-center py-20">
              <CardHeader>
                <Construction className="h-16 w-16 text-accent mx-auto mb-4" />
                <CardTitle className="font-headline text-2xl">Coming Soon!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  The <strong>{calculatorInfo.name}</strong> is currently under development.
                  Check back soon for this powerful tool!
                </p>
                <Button asChild>
                  <Link href="/calculators">Explore Other Calculators</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <aside className="lg:col-span-1 space-y-6">
          <Suspense fallback={<SeoAsideFallback />}>
            <SeoAsideContent calculatorInfo={calculatorInfo} isCalculatorImplemented={!!CalculatorComponent} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

    
