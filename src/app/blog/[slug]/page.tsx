import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Placeholder for fetching actual blog post data based on slug
// In a real app, this would fetch from a database or CMS
const getBlogPostBySlug = async (slug: string) => {
  // Simulating fetching post details
  const posts = [
    { slug: 'understanding-compound-interest', title: 'Understanding Compound Interest for Long-Term Growth', category: 'Investing Basics', date: 'October 26, 2023', imageUrl: 'https://placehold.co/800x400.png', keywords: ['compound interest', 'investment growth', 'finance basics'], dataAiHint: 'financial education' },
    { slug: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', category: 'Cryptocurrency', date: 'October 24, 2023', imageUrl: 'https://placehold.co/800x400.png', keywords: ['bitcoin roi', 'crypto basics', 'digital assets'], dataAiHint: 'crypto chart' },
    { slug: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', category: 'Mutual Funds', date: 'October 22, 2023', imageUrl: 'https://placehold.co/800x400.png', keywords: ['sip strategy', 'ai investing', 'mutual funds'], dataAiHint: 'investment plan' },
    { slug: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', category: 'Market Analysis', date: 'October 20, 2023', imageUrl: 'https://placehold.co/800x400.png', keywords: ['market volatility', 'investment tips', 'risk management'], dataAiHint: 'stock analysis' },
  ];
  return posts.find(p => p.slug === slug);
};

export async function generateStaticParams() {
  const posts = [ // Same slugs as above for consistency
    { slug: 'understanding-compound-interest' },
    { slug: 'beginners-guide-bitcoin-roi' },
    { slug: 'maximizing-sip-investments' },
    { slug: 'navigating-market-volatility' },
  ];
  return posts.map(post => ({ slug: post.slug }));
}


interface BlogPostPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const postDetails = await getBlogPostBySlug(params.slug);

  if (!postDetails) {
    return <div className="container mx-auto py-8 text-center">Blog post not found.</div>;
  }

  let seoContent = { title: postDetails.title, content: `Detailed content for ${postDetails.title} goes here. This article will delve into ${postDetails.keywords.join(', ')} offering valuable insights and practical advice.` };
  try {
    seoContent = await generateSeoContent({
      calculatorName: `Blog Post: ${postDetails.title}`, // Using calculatorName for topic for the AI
      keywords: postDetails.keywords.join(', '),
    });
  } catch (error) {
    console.error("Failed to generate blog content:", error);
  }
  
  // Basic formatting for AI content
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
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <article>
        <header className="mb-8">
          <div className="mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          <Badge variant="secondary" className="mb-2">{postDetails.category}</Badge>
          <h1 className="text-4xl font-bold mb-3 font-headline">{seoContent.title}</h1>
          <p className="text-muted-foreground text-sm">{postDetails.date}</p>
        </header>

        <Image 
          src={postDetails.imageUrl} 
          alt={seoContent.title} 
          width={800} 
          height={400} 
          className="w-full rounded-lg shadow-md mb-8 object-cover"
          data-ai-hint={postDetails.dataAiHint} 
          priority
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedSeoContent }} />
      </article>

      <aside className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-6 font-headline">Related Topics</h2>
        <div className="space-y-4">
          {postDetails.keywords.map(keyword => (
            <Badge key={keyword} variant="outline" className="mr-2">{keyword}</Badge>
          ))}
        </div>
         <div className="mt-8">
            <Button asChild>
                <Link href="/calculators">Explore Calculators</Link>
            </Button>
        </div>
      </aside>
    </div>
  );
}
