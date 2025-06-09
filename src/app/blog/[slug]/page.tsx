
import { generateSeoContent } from '@/ai/flows/generate-seo-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCalculatorById, CALCULATORS_DATA, type CalculatorFeature } from '@/lib/calculator-definitions';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogImage {
  imageUrl: string;
  dataAiHint: string;
}

interface BaseBlogPostDetails {
  slug: string;
  title: string;
  category: string;
  date: string; 
  images: BlogImage[];
  keywords: string[];
  excerpt: string;
}

interface OriginalBlogPostDetails extends BaseBlogPostDetails {
  type: 'original';
  calculatorNameForAi: string;
}

interface CalculatorGuideBlogPostDetails extends BaseBlogPostDetails {
  type: 'calculatorGuide';
  calculatorNameForAi: string;
  originalCalculatorName: string;
}

type BlogPostDetailsExtended = OriginalBlogPostDetails | CalculatorGuideBlogPostDetails;


const originalBlogPosts: OriginalBlogPostDetails[] = [
    { slug: 'understanding-compound-interest', title: 'Understanding Compound Interest for Long-Term Growth', category: 'Investing Basics', date: 'October 26, 2023', images: [{ imageUrl: 'https://images.unsplash.com/photo-1589556763333-ad818080f39e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8Y29tcG91bmQlMjBpbnRlcmVzdHxlbnwwfHx8fDE3NDk0ODY4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'investment growth' }, { imageUrl: 'https://images.unsplash.com/photo-1626266061368-46a8f578ddd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yfGVufDB8fHx8MTc0OTQ4Njc1M3ww&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'calculation tools' }], keywords: ['compound interest', 'investment growth', 'finance basics'], excerpt: 'Explore the fundamentals of compound interest.', type: 'original', calculatorNameForAi: 'Blog Post: Understanding Compound Interest for Long-Term Growth' },
    { slug: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', category: 'Cryptocurrency', date: 'October 24, 2023', images: [{ imageUrl: 'https://images.unsplash.com/photo-1641197861542-83e511654ac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxiaXRjb2luJTIwcm9pfGVufDB8fHx8MTc0OTQ5MTE2OXww&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'crypto chart' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'bitcoin analysis' }], keywords: ['bitcoin roi', 'crypto basics', 'digital assets'], excerpt: 'Learn to calculate Bitcoin ROI.', type: 'original', calculatorNameForAi: 'Blog Post: Beginner\'s Guide to Bitcoin ROI Calculation' },
    { slug: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', category: 'Mutual Funds', date: 'October 22, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'investment plan' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'ai finance' }], keywords: ['sip strategy', 'ai investing', 'mutual funds'], excerpt: 'Optimize your SIP investments.', type: 'original', calculatorNameForAi: 'Blog Post: Maximizing Your SIP Investments with AI Insights' },
    { slug: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', category: 'Market Analysis', date: 'October 20, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'stock analysis' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'market graph' }], keywords: ['market volatility', 'investment tips', 'risk management'], excerpt: 'Tips for volatile markets.', type: 'original', calculatorNameForAi: 'Blog Post: Navigating Market Volatility: Tips for Investors' },
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


const getBlogPostBySlug = async (slug: string): Promise<BlogPostDetailsExtended | undefined> => {
  const predefinedPost = originalBlogPosts.find(p => p.slug === slug);
  if (predefinedPost) {
    return predefinedPost;
  }

  const calcGuidePrefix = 'guide-to-';
  const calcGuideSuffix = '-calculator';
  if (slug.startsWith(calcGuidePrefix) && slug.endsWith(calcGuideSuffix)) {
    const calcId = slug.substring(calcGuidePrefix.length, slug.length - calcGuideSuffix.length);
    const calculator = getCalculatorById(calcId);
    if (calculator) {
      let firstImageUrl = 'https://placehold.co/800x400.png';
      let firstImageHint = '';
      let secondImageUrl = 'https://placehold.co/800x300.png';
      let secondImageHint = '';
      const hints = getCalculatorBlogImageHints(calculator);

      if (calcId === 'compound-interest') {
        firstImageUrl = 'https://images.unsplash.com/photo-1494887205043-c5f291293cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb21wb3VuZCUyMGludGVyZXN0fGVufDB8fHx8MTc0OTQ4NjgzNnww&ixlib=rb-4.1.0&q=80&w=1080';
        firstImageHint = 'growth';
        secondImageHint = hints.hint2 !== 'growth' ? hints.hint2 : 'tools';
      } else if (calcId === 'stock-return') {
        firstImageUrl = 'https://images.unsplash.com/photo-1621264437251-59d700cfb327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8U3RvY2slMjBSZXR1cm4lMjB8ZW58MHx8fHwxNzQ5NDg3OTA1fDA&ixlib=rb-4.1.0&q=80&w=1080';
        firstImageHint = 'stock';
        secondImageUrl = 'https://images.unsplash.com/photo-1559067096-49ebca3406aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxpbnZlc3RtZW50fGVufDB8fHx8MTc0OTQ4NzkzMnww&ixlib=rb-4.1.0&q=80&w=1080';
        secondImageHint = 'return';
      } else if (calcId === 'dividend-yield') {
        firstImageUrl = 'https://images.unsplash.com/photo-1723587693188-52754b315b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxEaXZpZGVuZCUyMHxlbnwwfHx8fDE3NDk0ODkzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080';
        firstImageHint = 'dividend';
        secondImageUrl = 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzaGFyZXN8ZW58MHx8fHwxNzQ5NDg5NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080';
        secondImageHint = 'shares'; 
      } else if (calcId === 'risk-reward-ratio') {
        firstImageUrl = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxyaXNrfGVufDB8fHx8MTc0OTQ5MDEyOHww&ixlib=rb-4.1.0&q=80&w=1080';
        firstImageHint = 'risk analysis';
        secondImageHint = hints.hint2 !== 'risk' && hints.hint2 !== 'analysis' ? hints.hint2 : 'strategy';
      } else if (calcId === 'volatility') {
        firstImageUrl = 'https://images.unsplash.com/photo-1625351814208-155cfe221d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx2b2xhdGlsaXR5fGVufDB8fHx8MTc0OTQ5MTAxOHww&ixlib=rb-4.1.0&q=80&w=1080';
        firstImageHint = 'market chart';
        secondImageHint = hints.hint2 !== 'market' && hints.hint2 !== 'chart' ? hints.hint2 : 'analysis';
      } else {
        firstImageHint = hints.hint1;
        secondImageHint = hints.hint2;
      }
      
      if (calcId === 'compound-interest' && secondImageUrl === 'https://placehold.co/800x300.png') {
          if (hints.hint2 !== "growth") {
            secondImageHint = hints.hint2;
          } else {
            secondImageHint = "tools"; 
          }
      }


      return {
        slug,
        title: `Comprehensive Guide: ${calculator.name}`,
        category: calculator.category,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        images: [
          { imageUrl: firstImageUrl, dataAiHint: firstImageHint },
          { imageUrl: secondImageUrl, dataAiHint: secondImageHint },
        ],
        keywords: [...calculator.keywords, 'guide', calculator.name.toLowerCase().replace(/\s+/g, ' ')],
        excerpt: `Learn all about the ${calculator.name} and how to use it effectively.`,
        calculatorNameForAi: `Blog Post: A Comprehensive Guide to the ${calculator.name}`,
        type: 'calculatorGuide',
        originalCalculatorName: calculator.name,
      };
    }
  }
  return undefined;
};

export async function generateStaticParams() {
  const originalPostSlugs = originalBlogPosts.map(post => ({ slug: post.slug }));
  const calculatorSlugs = CALCULATORS_DATA.map(calc => ({ slug: `guide-to-${calc.id}-calculator` }));
  return [...originalPostSlugs, ...calculatorSlugs];
}


interface BlogPostPageProps {
  params: { slug: string };
}

async function AiGeneratedContent({ postDetails, initialSeoTitleForImage }: { 
  postDetails: BlogPostDetailsExtended,
  initialSeoTitleForImage: string 
}) {
  let seoContent = { title: postDetails.title, content: `Detailed content for ${postDetails.title} goes here. This article will delve into ${postDetails.keywords.join(', ')} offering valuable insights and practical advice.` };
  
  const contentGenLabel = `AI_BLOG_CONTENT_GENERATION_FOR_SLUG_${postDetails.slug}`;
  console.time(contentGenLabel);

  try {
    seoContent = await generateSeoContent({
      calculatorName: postDetails.calculatorNameForAi,
      keywords: postDetails.keywords.join(', '),
    });
  } catch (error: any) {
    const itemName = postDetails.type === 'calculatorGuide' ? postDetails.originalCalculatorName : postDetails.title;
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
    seoContent.title = postDetails.title; 
    seoContent.content = `Apologies, we had trouble generating the full content for this topic. This post is about ${postDetails.title}. We will cover aspects like ${postDetails.keywords.join(', ')}.`;
  } finally {
    console.timeEnd(contentGenLabel);
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

  const headingSplitRegex = /(<\/h[23]>)/i;
  const splitByHeading = formattedSeoContent.split(headingSplitRegex);

  if (splitByHeading.length > 2) { 
    contentPart1 = splitByHeading.slice(0, 2).join('');
    contentPart2 = splitByHeading.slice(2).join('');
  } else {
    const lines = formattedSeoContent.split(/<br\s*\/?>/i);
    if (lines.length > 1) {
      const splitIndex = Math.min(3, Math.floor(lines.length / 2));
      contentPart1 = lines.slice(0, splitIndex).join('<br />') + (lines.length > splitIndex ? '<br />' : '');
      contentPart2 = lines.slice(splitIndex).join('<br />');
    }
  }

  const secondImage = postDetails.images.length > 1 ? postDetails.images[1] : null;

  return (
    <>
      <h1 className="text-4xl font-bold mb-3 font-headline">{seoContent.title || initialSeoTitleForImage}</h1>
      <p className="text-muted-foreground text-sm mb-8">{postDetails.date}</p>
      
      <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentPart1 }} />

      {secondImage && (
        <Image
          key={`${postDetails.slug}-img2-${secondImage.imageUrl}`}
          src={secondImage.imageUrl}
          alt={`${seoContent.title || initialSeoTitleForImage || 'Blog illustration'} - illustration`}
          width={800}
          height={300}
          className="w-full rounded-lg shadow-md my-8 object-cover"
          data-ai-hint={secondImage.dataAiHint}
        />
      )}

      {contentPart2 && (
        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentPart2 }} />
      )}
    </>
  );
}

function AiContentFallback() {
  return (
    <>
      <Skeleton className="h-10 w-3/4 mb-3" /> {/* Title */}
      <Skeleton className="h-4 w-1/4 mb-8" /> {/* Date */}
      
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-5/6 mb-4" />
      
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-6 w-full mb-8" />

      <Skeleton className="h-[300px] w-full rounded-lg shadow-md my-8" /> {/* Second Image Placeholder */}
      
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-4/6 mb-2" />
    </>
  )
}


export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const postDetails = await getBlogPostBySlug(params.slug);

  if (!postDetails || !postDetails.images || postDetails.images.length === 0) {
    return <div className="container mx-auto py-8 text-center">Blog post or primary image not found.</div>;
  }

  const firstImage = postDetails.images[0];

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <article>
        <header className="mb-4">
          <div className="mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          <Badge variant="secondary" className="mb-2">{postDetails.category}</Badge>
        </header>

        <Image
          key={`${postDetails.slug}-img1-${firstImage.imageUrl}`}
          src={firstImage.imageUrl}
          alt={postDetails.title}
          width={800}
          height={400}
          className="w-full rounded-lg shadow-md mb-8 object-cover"
          data-ai-hint={firstImage.dataAiHint}
          priority
        />
        
        <Suspense fallback={<AiContentFallback />}>
          <AiGeneratedContent postDetails={postDetails} 
            initialSeoTitleForImage={postDetails.title} />
        </Suspense>

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

