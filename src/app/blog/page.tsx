import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Placeholder blog posts - In a real app, this would come from a CMS or AI generation process
const blogPosts = [
  { id: 'understanding-compound-interest', title: 'Understanding Compound Interest for Long-Term Growth', excerpt: 'Learn how the power of compounding can significantly boost your investments over time. An essential read for new and seasoned investors alike.', imageUrl: 'https://placehold.co/600x400.png', date: 'October 26, 2023', category: 'Investing Basics', dataAiHint: 'finance chart' },
  { id: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', excerpt: 'Demystifying Bitcoin investments and how to calculate potential returns and risks. Understand the volatility and opportunities.', imageUrl: 'https://placehold.co/600x400.png', date: 'October 24, 2023', category: 'Cryptocurrency', dataAiHint: 'bitcoin graph' },
  { id: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', excerpt: 'Discover strategies to optimize your Systematic Investment Plans using AI-driven analytics and market trends.', imageUrl: 'https://placehold.co/600x400.png', date: 'October 22, 2023', category: 'Mutual Funds', dataAiHint: 'investment portfolio' },
  { id: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', excerpt: 'Strategies to protect your portfolio and find opportunities during turbulent market conditions. Learn from historical data and AI predictions.', imageUrl: 'https://placehold.co/600x400.png', date: 'October 20, 2023', category: 'Market Analysis', dataAiHint: 'stock market' },
];

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
        {blogPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Link href={`/blog/${post.id}`} className="block">
              <Image 
                src={post.imageUrl} 
                alt={post.title} 
                width={600} 
                height={300} // Adjusted for better aspect ratio
                className="w-full h-48 object-cover"
                data-ai-hint={post.dataAiHint} 
              />
            </Link>
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
