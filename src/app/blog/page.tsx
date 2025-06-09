
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CALCULATORS_DATA, type CalculatorFeature } from '@/lib/calculator-definitions';

interface BlogImage {
  imageUrl: string;
  dataAiHint: string;
}

interface BlogPostEntry {
  id: string; // This will be the slug
  title: string;
  excerpt: string;
  images: BlogImage[];
  date: string;
  category: string;
}

// Original blog posts
const originalBlogPosts: BlogPostEntry[] = [
  { id: 'understanding-compound-interest', title: 'Understanding Compound Interest for Long-Term Growth', excerpt: 'Learn how the power of compounding can significantly boost your investments over time. An essential read for new and seasoned investors alike.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1589556763333-ad818080f39e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8Y29tcG91bmQlMjBpbnRlcmVzdHxlbnwwfHx8fDE3NDk0ODY4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'investment growth' }, { imageUrl: 'https://images.unsplash.com/photo-1626266061368-46a8f578ddd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yfGVufDB8fHx8MTc0OTQ4Njc1M3ww&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'calculation tools' }], date: 'October 26, 2023', category: 'Investing Basics' },
  { id: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', excerpt: 'Demystifying Bitcoin investments and how to calculate potential returns and risks. Understand the volatility and opportunities.', images: [{ imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'crypto chart' }, { imageUrl: 'https://placehold.co/600x300.png', dataAiHint: 'bitcoin analysis' }], date: 'October 24, 2023', category: 'Cryptocurrency' },
  { id: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', excerpt: 'Discover strategies to optimize your Systematic Investment Plans using AI-driven analytics and market trends.', images: [{ imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'investment plan' }, { imageUrl: 'https://placehold.co/600x300.png', dataAiHint: 'ai finance' }], date: 'October 22, 2023', category: 'Mutual Funds' },
  { id: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', excerpt: 'Strategies to protect your portfolio and find opportunities during turbulent market conditions. Learn from historical data and AI predictions.', images: [{ imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'stock analysis' }, { imageUrl: 'https://placehold.co/600x300.png', dataAiHint: 'market graph' }], date: 'October 20, 2023', category: 'Market Analysis' },
];

const getCalculatorBlogImageHints = (calculator: CalculatorFeature): { hint1: string, hint2: string } => {
  const nameParts = calculator.name.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/).filter(Boolean);
  const keywordParts = calculator.keywords.flatMap(k => k.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/).filter(Boolean));

  const allWords = [...new Set([...nameParts, ...keywordParts])].slice(0, 10); 

  let hint1 = allWords.length > 0 ? allWords[0] : "finance";
  let hint2 = allWords.length > 1 ? allWords[1] : "tool";
  
  if (hint1 === hint2) {
    hint2 = allWords.length > 2 ? allWords[2] : (hint1 === "finance" ? "money" : "plan");
  }
  if (hint1 === hint2) { 
      hint2 = "calc"; 
  }

  hint1 = hint1.split(" ")[0];
  hint2 = hint2.split(" ")[0];

  return { hint1, hint2 };
};


// Generate blog post entries for each calculator
const calculatorBlogPosts: BlogPostEntry[] = CALCULATORS_DATA.map((calculator: CalculatorFeature) => {
  const slug = `guide-to-${calculator.id}-calculator`;
  let firstImageUrl = 'https://placehold.co/600x400.png';
  let firstImageHint = '';
  let secondImageUrl = 'https://placehold.co/600x300.png';
  let secondImageHint = '';

  if (calculator.id === 'compound-interest') {
    firstImageUrl = 'https://images.unsplash.com/photo-1494887205043-c5f291293cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb21wb3VuZCUyMGludGVyZXN0fGVufDB8fHx8MTc0OTQ4NjgzNnww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'growth';
    const hints = getCalculatorBlogImageHints(calculator);
    secondImageHint = hints.hint2 !== 'growth' ? hints.hint2 : 'tools';
  } else if (calculator.id === 'stock-return') {
    firstImageUrl = 'https://images.unsplash.com/photo-1621264437251-59d700cfb327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8U3RvY2slMjBSZXR1cm4lMjB8ZW58MHx8fHwxNzQ5NDg3OTA1fDA&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'stock';
    secondImageUrl = 'https://images.unsplash.com/photo-1559067096-49ebca3406aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxpbnZlc3RtZW50fGVufDB8fHx8MTc0OTQ4NzkzMnww&ixlib=rb-4.1.0&q=80&w=1080';
    secondImageHint = 'return';
  } else {
    const hints = getCalculatorBlogImageHints(calculator);
    firstImageHint = hints.hint1;
    secondImageHint = hints.hint2;
  }
  
  return {
    id: slug,
    title: `A Comprehensive Guide to the ${calculator.name}`,
    excerpt: `Explore the ${calculator.name}: understand its calculations, benefits, and how to use it effectively for your financial planning.`,
    images: [
      { imageUrl: firstImageUrl, dataAiHint: firstImageHint },
      { imageUrl: secondImageUrl, dataAiHint: secondImageHint } 
    ],
    date: 'November 15, 2023', // Generic recent date
    category: calculator.category,
  };
});

const allBlogPosts: BlogPostEntry[] = [...originalBlogPosts, ...calculatorBlogPosts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function BlogPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-headline">InvestAI Blog</h1>
        <p className="text-xl text-muted-foreground">
          Insights, guides, and updates on the world of investment, powered by AI.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allBlogPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {post.images && post.images.length > 0 && (
              <Link href={`/blog/${post.id}`} className="block">
                <Image 
                  src={post.images[0].imageUrl} 
                  alt={post.title} 
                  width={600} 
                  height={300} 
                  className="w-full h-48 object-cover"
                  data-ai-hint={post.images[0].dataAiHint} 
                />
              </Link>
            )}
            <CardHeader>
              <Link href={`/blog/${post.id}`} className="block">
                <CardTitle className="font-headline text-xl hover:text-primary transition-colors">{post.title}</CardTitle>
              </Link>
              <p className="text-sm text-muted-foreground">{post.date} - {post.category}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{post.excerpt}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="px-0 text-primary">
                <Link href={`/blog/${post.id}`}>
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

