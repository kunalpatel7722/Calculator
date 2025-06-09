
import { getCalculatorById, CALCULATORS_DATA } from '@/lib/calculator-definitions';
import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Construction } from 'lucide-react';

// Specific calculator components (client components)
import { CompoundInterestCalculator } from '@/app/calculators/_components/CompoundInterestCalculator';
// Import other calculator components here as they are created
// import { BitcoinROICalculator } from '@/app/calculators/_components/BitcoinROICalculator';
// import { SIPCalculatorComponent } from '@/app/calculators/_components/SIPCalculator';


// This function generates static paths for all calculators at build time.
export async function generateStaticParams() {
  return CALCULATORS_DATA.map((calculator) => ({
    slug: calculator.id,
  }));
}

interface CalculatorPageProps {
  params: { slug: string };
}

// Helper to map slug to actual calculator component
const getCalculatorComponent = (slug: string) => {
  switch (slug) {
    case 'compound-interest':
      return CompoundInterestCalculator;
    // case 'bitcoin-roi':
    //   return BitcoinROICalculator;
    // case 'sip-calculator':
    //   return SIPCalculatorComponent;
    default:
      return null;
  }
};


export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = params;
  const calculatorInfo = getCalculatorById(slug);

  if (!calculatorInfo) {
    return <div className="container mx-auto py-8 text-center">Calculator not found.</div>;
  }

  const CalculatorComponent = getCalculatorComponent(slug);

  let seoContent = { title: calculatorInfo.name, content: calculatorInfo.description };
  try {
    // Only fetch fresh SEO for pages that have a component, otherwise it's "Coming Soon"
    if (CalculatorComponent) {
      seoContent = await generateSeoContent({
        calculatorName: calculatorInfo.name,
        keywords: calculatorInfo.keywords.join(', '),
      });
    }
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
  }

  // Basic formatting for AI content (can be enhanced)
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{seoContent.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: formattedSeoContent }} />
            </CardContent>
          </Card>
          
          {CalculatorComponent && ( // Only show "How it Works" if calculator is implemented
             <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">How it Works</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  {/* Placeholder for specific "How it Works" content. This should be dynamic based on calculator type. */}
                  <p>This section explains the principles and formulas behind the {calculatorInfo.name}. For detailed information, refer to the AI-generated content above or financial education resources.</p>
                </CardContent>
              </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
