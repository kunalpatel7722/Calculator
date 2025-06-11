
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { CALCULATORS_DATA, type CalculatorFeature } from '@/lib/calculator-definitions';
import { Input } from '@/components/ui/input';

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
  { id: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', excerpt: 'Demystifying Bitcoin investments and how to calculate potential returns and risks. Understand the volatility and opportunities.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1641197861542-83e511654ac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxiaXRjb2luJTIwcm9pfGVufDB8fHx8MTc0OTQ5MTE2OXww&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'crypto chart' }, { imageUrl: 'https://placehold.co/600x300.png', dataAiHint: 'bitcoin analysis' }], date: 'October 24, 2023', category: 'Cryptocurrency' },
  { id: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', excerpt: 'Discover strategies to optimize your Systematic Investment Plans using AI-driven analytics and market trends.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1560264418-c4445382edbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2hhcmUlMjBtYXJrZXQlMjB8ZW58MHx8fHwxNzQ5NjQxODc5fDA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'investment strategy' }, { imageUrl: 'https://placehold.co/600x300.png', dataAiHint: 'ai finance' }], date: 'October 22, 2023', category: 'Mutual Funds' },
  { id: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', excerpt: 'Strategies to protect your portfolio and find opportunities during turbulent market conditions. Learn from historical data and AI predictions.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0aXBzfGVufDB8fHx8MTc0OTY0MjUwNnww&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'remote control' }, { imageUrl: 'https://placehold.co/600x300.png', dataAiHint: 'market graph' }], date: 'October 20, 2023', category: 'Market Analysis' },
];

const getCalculatorBlogImageHints = (calculator: CalculatorFeature): { hint1: string, hint2: string } => {
  const nameAndKeywords = [
    calculator.name.toLowerCase(),
    ...calculator.keywords.map(k => k.toLowerCase())
  ];

  let potentialHints: string[] = [];

  for (const phrase of nameAndKeywords) {
    const cleanedPhrase = phrase.replace(/[^a-z0-9\s-]/gi, '').trim();
    const wordsInPhrase = cleanedPhrase.split(/\s+/).filter(Boolean);
    if (wordsInPhrase.length === 1 || wordsInPhrase.length === 2) {
      potentialHints.push(cleanedPhrase);
    }
  }

  const allSingleWordsRaw = nameAndKeywords.flatMap(p => p.split(/\s+/));
  const allSingleWords = [...new Set(allSingleWordsRaw.map(w => w.replace(/[^a-z0-9-]/gi, '').trim()).filter(Boolean))];
  
  for (const singleWord of allSingleWords) {
    if (!potentialHints.some(p => p.includes(singleWord))) {
      potentialHints.push(singleWord);
    }
  }
  
  potentialHints = [...new Set(potentialHints)];

  const commonBadWords = new Set(['calculator', 'guide', 'tool', 'online', 'free', 'best', 'app', 'the', 'for', 'and', 'with', 'new', 'feature', 'easy', 'simple', 'vs', 'of', 'to', 'roi', 'ai', 'plan', 'strategy', 'analysis', 'money', 'asset', 'assets', 'fund', 'funds', 'market', calculator.id.toLowerCase()]);
  
  let uniqueValidHints = potentialHints.filter(h => {
    if (!h || h.length <= 2) return false;
    const words = h.split(/\s+/).filter(Boolean);
    if (words.length > 2) return false; 
    if (words.length === 1 && commonBadWords.has(words[0])) return false;
    if (words.length === 2 && words.every(w => commonBadWords.has(w))) return false; 
    return true;
  });
  
  uniqueValidHints.sort((a, b) => {
    const aWords = a.split(/\s+/).length;
    const bWords = b.split(/\s+/).length;
    if (aWords !== bWords) return bWords - aWords; 
    return b.length - a.length; 
  });

  let hint1 = uniqueValidHints.length > 0 ? uniqueValidHints[0] : "finance growth";
  let hint2 = "planning tool"; 

  if (uniqueValidHints.length > 1) {
    const secondHintCandidate = uniqueValidHints.find(h => h !== hint1);
    if (secondHintCandidate) {
      hint2 = secondHintCandidate;
    } else if (hint1 === "planning tool") { 
      hint2 = "data chart";
    }
  } else if (hint1 === "planning tool") { 
      hint2 = "finance growth";
  } else if (hint1 === "finance growth"){ 
      hint2 = "data chart";
  }

  if (hint1 === hint2) {
    if (hint1 === "finance growth") hint2 = "investment chart";
    else if (hint1 === "investment chart") hint2 = "digital assets";
    else hint2 = "stock market"; 
  }

  return { hint1, hint2 };
};


// Generate blog post entries for each calculator
const calculatorBlogPosts: BlogPostEntry[] = CALCULATORS_DATA.map((calculator: CalculatorFeature) => {
  const slug = `guide-to-${calculator.id}-calculator`;
  let firstImageUrl = 'https://images.unsplash.com/photo-1551135049-8a33b5883817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8aW52ZXN0b3J8ZW58MHx8fHwxNzQ5NjQyMTMxfDA&ixlib=rb-4.1.0&q=80&w=1080';
  let firstImageHint = ''; // Will be set by specific overrides or the final else block
  
  const hints = getCalculatorBlogImageHints(calculator);

  if (calculator.id === 'compound-interest') {
    firstImageUrl = 'https://images.unsplash.com/photo-1494887205043-c5f291293cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb21wb3VuZCUyMGludGVyZXN0fGVufDB8fHx8MTc0OTQ4NjgzNnww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'growth chart';
  } else if (calculator.id === 'stock-return') {
    firstImageUrl = 'https://images.unsplash.com/photo-1621264437251-59d700cfb327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8U3RvY2slMjBSZXR1cm4lMjB8ZW58MHx8fHwxNzQ5NDg3OTA1fDA&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'stock return';
  } else if (calculator.id === 'dividend-yield') {
    firstImageUrl = 'https://images.unsplash.com/photo-1723587693188-52754b315b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxEaXZpZGVuZCUyMHxlbnwwfHx8fDE3NDk0ODkzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'dividend income';
  } else if (calculator.id === 'risk-reward-ratio') {
    firstImageUrl = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxyaXNrfGVufDB8fHx8MTc0OTQ5MDEyOHww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'risk reward';
  } else if (calculator.id === 'volatility') {
    firstImageUrl = 'https://images.unsplash.com/photo-1625351814208-155cfe221d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx2b2xhdGlsaXR5fGVufDB8fHx8MTc0OTQ5MTAxOHww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'market volatility';
  } else if (calculator.id === 'bitcoin-roi') {
    firstImageUrl = 'https://images.unsplash.com/photo-1543699539-33a389c5dcfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxiaXRjb2lufGVufDB8fHx8MTc0OTQ1ODU1OXww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'bitcoin profit';
  } else if (calculator.id === 'portfolio-allocation') {
    firstImageUrl = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwb3J0Zm9saW8lMjBhbGxvY2F0aW9ufGVufDB8fHx8MTc0OTQ5MzQzNnww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'portfolio diversity';
  } else if (calculator.id === 'loan-vs-investment') {
    firstImageUrl = 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxsb2FuJTIwdnMlMjBpbnZlc3RtZW50fGVufDB8fHx8MTc0OTQ5Mzk3Mnww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'financial decision';
  } else if (calculator.id === 'real-estate-roi') {
    firstImageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxyZWFsJTIwZXN0YXRlfGVufDB8fHx8MTc0OTQ5NDE5Nnww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'property income';
  } else if (calculator.id === 'goal-planning') {
    firstImageUrl = 'https://images.unsplash.com/photo-1629721671030-a83edbb11211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxnb2FsfGVufDB8fHx8MTc0OTU0MTg5M3ww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'financial goals';
  } else if (calculator.id === 'time-value-of-money') {
    firstImageUrl = 'https://images.unsplash.com/photo-1533749047139-189de3cf06d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHx0aW1lJTIwdmFsdWUlMjBtb25leXxlbnwwfHx8fDE3NDk1MzgyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'money time';
  } else if (calculator.id === 'sip-calculator') {
    firstImageUrl = 'https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjYWxjdWxhdG9yfGVufDB8fHx8MTc0OTYxMzA3MHww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'investment growth';
  } else if (calculator.id === 'sip-vs-lumpsum') {
    firstImageUrl = 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0aXBzfGVufDB8fHx8MTc0OTY0MjUwNnww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'remote control'; // Changed to match the latest update
  } else if (calculator.id === 'swp-calculator') {
    firstImageUrl = 'https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxvbGQlMjB8ZW58MHx8fHwxNzQ5NjEzMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'retirement planning';
  } else if (calculator.id === 'currency-converter') {
    firstImageUrl = 'https://images.unsplash.com/photo-1583574928108-53be39420a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8ZG9sbGFyfGVufDB8fHx8MTc0OTYxMjY5M3ww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'currency exchange';
  } else if (calculator.id === 'annuity-calculator') {
    firstImageUrl = 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhbm51aXR5fGVufDB8fHx8MTc0OTYxODc1MXww&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'annuity income';
  } else if (calculator.category === 'Crypto') {
    firstImageUrl = 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjcnlwdG98ZW58MHx8fHwxNzQ5NjQ0MDE0fDA&ixlib=rb-4.1.0&q=80&w=1080';
    firstImageHint = 'blockchain tech';
  }
  else { 
    // Default hint from the improved function if no specific override
    firstImageHint = hints.hint1;
  }
  
  return {
    id: slug,
    title: `A Comprehensive Guide to the ${calculator.name}`,
    excerpt: `Explore the ${calculator.name}: understand its calculations, benefits, and how to use it effectively for your financial planning.`,
    images: [
      { imageUrl: firstImageUrl, dataAiHint: firstImageHint },
      // Second image hint for calculator guides will use hints.hint2 if a second image is ever shown on the card
    ],
    date: 'November 15, 2023', // Generic recent date
    category: calculator.category,
  };
});

const allBlogPosts: BlogPostEntry[] = [...originalBlogPosts, ...calculatorBlogPosts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBlogPosts = useMemo(() => {
    if (!searchTerm) {
      return allBlogPosts;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allBlogPosts.filter(post =>
      post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      post.excerpt.toLowerCase().includes(lowerCaseSearchTerm) ||
      post.category.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-headline">InvestAI Blog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Insights, guides, and updates on the world of investment, powered by AI.
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search blog posts (e.g., 'compound interest', 'bitcoin', 'guide')..."
            className="w-full pl-10 pr-4 py-2 text-lg h-11 rounded-lg shadow-md focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search blog posts"
          />
        </div>
      </header>

      {filteredBlogPosts.length === 0 && searchTerm && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No blog posts found matching your search term "{searchTerm}".</p>
          <p className="text-md text-muted-foreground mt-2">Try a different keyword or clear the search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogPosts.map((post) => (
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
       {filteredBlogPosts.length > 0 && filteredBlogPosts.length < allBlogPosts.length && searchTerm && (
         <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">Showing {filteredBlogPosts.length} of {allBlogPosts.length} blog posts.</p>
         </div>
       )}
    </div>
  );
}

