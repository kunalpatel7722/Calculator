
import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

interface BlogImage {
  imageUrl: string;
  dataAiHint: string;
}

interface BlogPostDetails {
  slug: string;
  title: string;
  category: string;
  date: string;
  images: BlogImage[];
  keywords: string[];
}

// Placeholder for fetching actual blog post data based on slug
// In a real app, this would fetch from a database or CMS
const getBlogPostBySlug = async (slug: string): Promise<BlogPostDetails | undefined> => {
  // Simulating fetching post details
  const posts: BlogPostDetails[] = [
    { slug: 'understanding-compound-interest', title: 'Understanding Compound Interest for Long-Term Growth', category: 'Investing Basics', date: 'October 26, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'financial education' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'investment chart' }], keywords: ['compound interest', 'investment growth', 'finance basics'] },
    { slug: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', category: 'Cryptocurrency', date: 'October 24, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'crypto chart' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'bitcoin analysis' }], keywords: ['bitcoin roi', 'crypto basics', 'digital assets'] },
    { slug: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', category: 'Mutual Funds', date: 'October 22, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'investment plan' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'ai finance' }], keywords: ['sip strategy', 'ai investing', 'mutual funds'] },
    { slug: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', category: 'Market Analysis', date: 'October 20, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'stock analysis' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'market graph' }], keywords: ['market volatility', 'investment tips', 'risk management'] },
  ];
  return posts.find(p => p.slug === slug);
};

export async function generateStaticParams() {
  const posts = [ 
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

  if (!postDetails || !postDetails.images || postDetails.images.length === 0) {
    return <div className="container mx-auto py-8 text-center">Blog post or primary image not found.</div>;
  }

  const firstImage = postDetails.images[0];
  const secondImage = postDetails.images.length > 1 ? postDetails.images[1] : null;

  let seoContent = { title: postDetails.title, content: `Detailed content for ${postDetails.title} goes here. This article will delve into ${postDetails.keywords.join(', ')} offering valuable insights and practical advice.` };
  try {
    seoContent = await generateSeoContent({
      calculatorName: `Blog Post: ${postDetails.title}`, 
      keywords: postDetails.keywords.join(', '),
    });
  } catch (error: any) {
    const itemName = postDetails.title;
    let errorDetailsText = "Unknown error occurred.";

    if (error instanceof Error) {
      errorDetailsText = `Message: ${error.message}`;
    } else if (error && typeof error === 'object' && error.message) {
      errorDetailsText = `Message: ${error.message}`;
    } else if (error) {
       try {
        errorDetailsText = `Details: ${JSON.stringify(error)}`;
      } catch (e) {
        errorDetailsText = `Details: Unserializable error object. Keys: ${Object.keys(error || {}).join(', ')}`;
      }
    }
    console.error(`Failed to generate blog content for "${itemName}". ${errorDetailsText}`);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace for the above error:", error.stack);
    } else if (error && typeof error === 'object') {
      console.error("Raw error object for AI content generation failure:", error);
    }
  }
  
  const formattedSeoContent = seoContent.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(?:\n|<br \s*\/?>)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(?:\n|<br \s*\/?>)/g, '<h2>$1</h2>')
    .replace(/# (.*?)(?:\n|<br \s*\/?>)/g, '<h1>$1</h1>')
    .replace(/^- (.*?)(?:\n|<br \s*\/?>)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n/g, '<br />');

  let contentPart1 = formattedSeoContent;
  let contentPart2 = '';

  const headingSplitRegex = /(<\/h[23]>)/i; // Matches </h2> or </h3>
  const splitByHeading = formattedSeoContent.split(headingSplitRegex);

  if (splitByHeading.length > 1) {
    contentPart1 = splitByHeading.slice(0, 2).join(''); // Content up to and including the closing h2/h3 tag
    contentPart2 = splitByHeading.slice(2).join('');
  } else {
    // Fallback: split by <br />
    const lines = formattedSeoContent.split(/<br\s*\/?>/i); // Split by <br />, <br/>, <br />
    if (lines.length > 1) {
      const splitIndex = Math.min(3, Math.floor(lines.length / 2)); // Insert after ~3rd line or middle
      contentPart1 = lines.slice(0, splitIndex).join('<br />') + (lines.length > splitIndex ? '<br />' : '');
      contentPart2 = lines.slice(splitIndex).join('<br />');
    }
    // If only one line or no <br />, contentPart2 remains empty, second image will appear after all contentPart1 if secondImage exists.
  }


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
          src={firstImage.imageUrl} 
          alt={seoContent.title} 
          width={800} 
          height={400} 
          className="w-full rounded-lg shadow-md mb-8 object-cover"
          data-ai-hint={firstImage.dataAiHint} 
          priority
        />
        
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentPart1 }} />

        {secondImage && (
          <Image
            src={secondImage.imageUrl}
            alt={`${seoContent.title} - illustration`}
            width={800}
            height={300}
            className="w-full rounded-lg shadow-md my-8 object-cover"
            data-ai-hint={secondImage.dataAiHint}
          />
        )}
        
        {contentPart2 && (
          <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentPart2 }} />
        )}
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
