
import { getCalculatorById, CALCULATORS_DATA, type CalculatorFeature } from '@/lib/calculator-definitions';
import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Construction } from 'lucide-react';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Specific calculator components (client components)
import { CompoundInterestCalculator } from '@/app/calculators/_components/CompoundInterestCalculator';
import { StockReturnCalculator } from '@/app/calculators/_components/StockReturnCalculator';
import { DividendYieldCalculator } from '@/app/calculators/_components/DividendYieldCalculator';
import { RiskRewardRatioCalculator } from '@/app/calculators/_components/RiskRewardRatioCalculator';
import { VolatilityCalculator } from '@/app/calculators/_components/VolatilityCalculator';
import { BitcoinRoiCalculator } from '@/app/calculators/_components/BitcoinRoiCalculator';
import { CryptoDcaCalculator } from '@/app/calculators/_components/CryptoDcaCalculator';
import { BlockchainFeeCalculator } from '@/app/calculators/_components/BlockchainFeeCalculator';
import { CryptoTaxCalculator } from '@/app/calculators/_components/CryptoTaxCalculator';
import { IcoIdoRoiCalculator } from '@/app/calculators/_components/IcoIdoRoiCalculator';
import { PortfolioAllocationCalculator } from '@/app/calculators/_components/PortfolioAllocationCalculator';
import { LoanVsInvestmentCalculator } from '@/app/calculators/_components/LoanVsInvestmentCalculator';
import { RealEstateRoiCalculator } from '@/app/calculators/_components/RealEstateRoiCalculator';
import { GoalPlanningCalculator } from '@/app/calculators/_components/GoalPlanningCalculator';
import { TimeValueOfMoneyCalculator } from '@/app/calculators/_components/TimeValueOfMoneyCalculator';
import { SipCalculator } from '@/app/calculators/_components/SipCalculator';
import { SipVsLumpsumCalculator } from '@/app/calculators/_components/SipVsLumpsumCalculator';
import { SwpCalculator } from '@/app/calculators/_components/SwpCalculator';
import { ElssTaxSavingCalculator } from '@/app/calculators/_components/ElssTaxSavingCalculator';
import { RetirementCorpusCalculator } from '@/app/calculators/_components/RetirementCorpusCalculator';
import { AnnuityCalculator } from '@/app/calculators/_components/AnnuityCalculator';
import { BearMarketSurvivalCalculator } from '@/app/calculators/_components/BearMarketSurvivalCalculator';
import { GlobalAllocationCalculator } from '@/app/calculators/_components/GlobalAllocationCalculator';
import { MarketTimingCostCalculator } from '@/app/calculators/_components/MarketTimingCostCalculator';


export async function generateStaticParams() {
  return CALCULATORS_DATA.map((calculator) => ({
    slug: calculator.id,
  }));
}

interface CalculatorPageProps {
  params: { slug: string };
}

const getCalculatorComponent = (slug: string) => {
  switch (slug) {
    case 'compound-interest': return CompoundInterestCalculator;
    case 'stock-return': return StockReturnCalculator;
    case 'dividend-yield': return DividendYieldCalculator;
    case 'risk-reward-ratio': return RiskRewardRatioCalculator;
    case 'volatility': return VolatilityCalculator;
    case 'bitcoin-roi': return BitcoinRoiCalculator;
    case 'crypto-dca': return CryptoDcaCalculator;
    case 'blockchain-fee': return BlockchainFeeCalculator;
    case 'crypto-tax': return CryptoTaxCalculator;
    case 'ico-ido-roi': return IcoIdoRoiCalculator;
    case 'portfolio-allocation': return PortfolioAllocationCalculator;
    case 'loan-vs-investment': return LoanVsInvestmentCalculator;
    case 'real-estate-roi': return RealEstateRoiCalculator;
    case 'goal-planning': return GoalPlanningCalculator;
    case 'time-value-of-money': return TimeValueOfMoneyCalculator;
    case 'sip-calculator': return SipCalculator;
    case 'sip-vs-lumpsum': return SipVsLumpsumCalculator;
    case 'swp-calculator': return SwpCalculator;
    case 'elss-tax-saving': return ElssTaxSavingCalculator;
    case 'retirement-corpus': return RetirementCorpusCalculator;
    case 'annuity-calculator': return AnnuityCalculator;
    case 'bear-market-survival': return BearMarketSurvivalCalculator;
    case 'global-allocation': return GlobalAllocationCalculator;
    case 'market-timing-cost': return MarketTimingCostCalculator;
    default: return null;
  }
};

async function SeoAsideContent({ calculatorInfo, isCalculatorImplemented }: { calculatorInfo: CalculatorFeature, isCalculatorImplemented: boolean }) {
  let seoContent = { title: calculatorInfo.name, content: calculatorInfo.description };
  if (isCalculatorImplemented) {
    // const contentGenLabel = `AI_CALCULATOR_SEO_GENERATION_FOR_SLUG_${calculatorInfo.id}`;
    // console.time(contentGenLabel); // Removed to prevent dev warnings
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
    } finally {
      // console.timeEnd(contentGenLabel); // Removed to prevent dev warnings
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

