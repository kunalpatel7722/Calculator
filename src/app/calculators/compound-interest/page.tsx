import { CompoundInterestCalculator } from '@/app/calculators/_components/CompoundInterestCalculator';
import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCalculatorById } from '@/lib/calculator-definitions';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic'; // Ensure fresh SEO content on each load if needed, or remove for SSG with revalidate

export default async function CompoundInterestPage() {
  const calculatorInfo = getCalculatorById('compound-interest');

  if (!calculatorInfo) {
    return <div className="container mx-auto py-8 text-center">Calculator not found.</div>;
  }

  let seoContent = { title: calculatorInfo.name, content: calculatorInfo.description };
  try {
    seoContent = await generateSeoContent({
      calculatorName: calculatorInfo.name,
      keywords: calculatorInfo.keywords.join(', '),
    });
  } catch (error) {
    console.error("Failed to generate SEO content:", error);
    // Use fallback content
  }
  
  const formattedSeoContent = seoContent.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')         // Italics
    .replace(/### (.*?)\n/g, '<h3>$1</h3>')       // H3
    .replace(/## (.*?)\n/g, '<h2>$1</h2>')         // H2
    .replace(/# (.*?)\n/g, '<h1>$1</h1>')           // H1
    .replace(/^- (.*?)\n/gm, '<li>$1</li>')       // List items (basic)
    // This is a basic list conversion. For nested lists or numbered lists, more complex regex is needed.
    // Wrap sequences of <li> into <ul>
    .replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n/g, '<br />');


  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3 font-headline">{calculatorInfo.name}</h1>
        <p className="text-lg text-muted-foreground">{calculatorInfo.description}</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <CompoundInterestCalculator />
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
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">How it Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>The compound interest formula is: <strong>A = P (1 + r/n)^(nt)</strong></p>
              <ul>
                <li><strong>A</strong> = the future value of the investment/loan, including interest</li>
                <li><strong>P</strong> = the principal investment amount (the initial deposit or loan amount)</li>
                <li><strong>r</strong> = the annual interest rate (decimal)</li>
                <li><strong>n</strong> = the number of times that interest is compounded per year</li>
                <li><strong>t</strong> = the number of years the money is invested or borrowed for</li>
              </ul>
              <p>This calculator helps you visualize how your money can grow over time by reinvesting the interest earned along with the principal.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
