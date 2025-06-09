
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
  date: string; // Consider using Date type if consistency is needed
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
    { slug: 'understanding-compound-interest', title: 'Understanding Compound Interest for Long-Term Growth', category: 'Investing Basics', date: 'October 26, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'investment growth' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'money plant' }], keywords: ['compound interest', 'investment growth', 'finance basics'], excerpt: 'Explore the fundamentals of compound interest.', type: 'original', calculatorNameForAi: 'Blog Post: Understanding Compound Interest for Long-Term Growth' },
    { slug: 'beginners-guide-bitcoin-roi', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', category: 'Cryptocurrency', date: 'October 24, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'crypto chart' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'bitcoin analysis' }], keywords: ['bitcoin roi', 'crypto basics', 'digital assets'], excerpt: 'Learn to calculate Bitcoin ROI.', type: 'original', calculatorNameForAi: 'Blog Post: Beginner\'s Guide to Bitcoin ROI Calculation' },
    { slug: 'maximizing-sip-investments', title: 'Maximizing Your SIP Investments with AI Insights', category: 'Mutual Funds', date: 'October 22, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'investment plan' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'ai finance' }], keywords: ['sip strategy', 'ai investing', 'mutual funds'], excerpt: 'Optimize your SIP investments.', type: 'original', calculatorNameForAi: 'Blog Post: Maximizing Your SIP Investments with AI Insights' },
    { slug: 'navigating-market-volatility', title: 'Navigating Market Volatility: Tips for Investors', category: 'Market Analysis', date: 'October 20, 2023', images: [{ imageUrl: 'https://placehold.co/800x400.png', dataAiHint: 'stock analysis' }, { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: 'market graph' }], keywords: ['market volatility', 'investment tips', 'risk management'], excerpt: 'Tips for volatile markets.', type: 'original', calculatorNameForAi: 'Blog Post: Navigating Market Volatility: Tips for Investors' },
];

const getCalculatorBlogImageHints = (calculator: CalculatorFeature): { hint1: string, hint2: string } => {
  const nameLower = calculator.name.toLowerCase();
  const keywordsLower = calculator.keywords.map(k => k.toLowerCase());

  let hint1 = "financial tool";
  let hint2 = "investment idea";

  if (nameLower.includes("loan") || keywordsLower.includes("loan")) {
    hint1 = "loan calculator";
    hint2 = "finance plan";
  } else if (nameLower.includes("bitcoin") || nameLower.includes("crypto") || nameLower.includes("blockchain") || nameLower.includes("ico") || nameLower.includes("ido")) {
    hint1 = "crypto concept";
    hint2 = "digital money";
  } else if (nameLower.includes("stock") || nameLower.includes("dividend") || nameLower.includes("market") || nameLower.includes("volatility")) {
    hint1 = "stock trading";
    hint2 = "market data";
  } else if (nameLower.includes("portfolio") || nameLower.includes("allocation")) {
    hint1 = "portfolio management";
    hint2 = "asset chart";
  } else if (nameLower.includes("real estate")) {
    hint1 = "property value";
    hint2 = "house market";
  } else if (nameLower.includes("tax")) {
    hint1 = "tax forms";
    hint2 = "finance documents";
  } else if (nameLower.includes("retirement") || nameLower.includes("annuity")) {
    hint1 = "retirement plan";
    hint2 = "savings growth";
  } else if (nameLower.includes("sip") || nameLower.includes("dca") || nameLower.includes("compound") || nameLower.includes("goal") || nameLower.includes("time value") ) {
    hint1 = "financial calculator";
    hint2 = "planning tools";
  }
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
      const { hint1, hint2 } = getCalculatorBlogImageHints(calculator);
      return {
        slug,
        title: `Comprehensive Guide: ${calculator.name}`,
        category: calculator.category,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        images: [
          { imageUrl: 'https://placehold.co/800x400.png', dataAiHint: hint1 },
          { imageUrl: 'https://placehold.co/800x300.png', dataAiHint: hint2 },
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
    seoContent.content = `Apologies, we had trouble generating the full content for this topic. This post is about ${postDetails.title}.`;
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
          key={postDetails.slug + '-img2'}
          src={secondImage.imageUrl}
          alt={`${seoContent.title || initialSeoTitleForImage} - illustration`}
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
          key={postDetails.slug + '-img1'}
          src={firstImage.imageUrl}
          alt={postDetails.title || "Main blog image"}
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
