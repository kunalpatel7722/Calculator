import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CALCULATORS_DATA, CalculatorFeature } from '@/lib/calculator-definitions';
import { ArrowRight, CheckCircle, Bot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CalculatorCard from '@/components/shared/CalculatorCard';

// Pick a few featured calculators
const featuredCalculators = CALCULATORS_DATA.filter(calc => ['compound-interest', 'bitcoin-roi', 'sip-calculator'].includes(calc.id));

// Placeholder blog posts
const latestBlogPosts = [
  { id: '1', title: 'Understanding Compound Interest for Long-Term Growth', excerpt: 'Learn how the power of compounding can significantly boost your investments over time.', imageUrl: 'https://images.unsplash.com/photo-1589556763333-ad818080f39e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8Y29tcG91bmQlMjBpbnRlcmVzdHxlbnwwfHx8fDE3NDk0ODY4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080', path: '/blog/understanding-compound-interest', dataAiHint: 'finance growth' },
  { id: '2', title: 'Beginner\'s Guide to Bitcoin ROI Calculation', excerpt: 'Demystifying Bitcoin investments and how to calculate potential returns and risks.', imageUrl: 'https://images.unsplash.com/photo-1641197861542-83e511654ac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxiaXRjb2luJTIwcm9pfGVufDB8fHx8MTc0OTQ5MTE2OXww&ixlib=rb-4.1.0&q=80&w=1080', path: '/blog/beginners-guide-bitcoin-roi', dataAiHint: 'crypto currency' },
  { id: '3', title: 'Maximizing Your SIP Investments with AI Insights', excerpt: 'Discover strategies to optimize your Systematic Investment Plans using AI-driven analytics.', imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxpbnZlc3RtZW50JTIwc2NyYWJibGUgdGV4dHxlbnwwfHx8fDE3NTAxNjIxNzJ8MA&ixlib=rb-4.0.3&q=80&w=1080', path: '/blog/maximizing-sip-investments', dataAiHint: 'investment strategy' },
];

// Placeholder testimonials
const testimonials = [
  { id: '1', name: 'Sarah L.', feedback: 'InvestAI\'s calculators are intuitive and helped me plan my finances much better. The AI insights are a game-changer!', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait' },
  { id: '2', name: 'John B.', feedback: 'Finally, a comprehensive suite of investment tools all in one place. The crypto calculators are particularly useful.', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'user profile' },
  { id: '3', name: 'Priya K.', feedback: 'The AI chatbot is surprisingly helpful for quick questions. Highly recommend InvestAI for anyone serious about their investments.', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'happy investor' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Bot className="h-16 w-16 mx-auto mb-6 text-background" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-headline">
            AI-Powered Investment Calculators
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-background/90">
            Make smarter financial decisions with our comprehensive suite of intelligent investment tools.
            From stocks and crypto to retirement planning, InvestAI has you covered.
          </p>
          <Button size="lg" asChild className="bg-background text-primary hover:bg-background/90">
            <Link href="/calculators">
              Explore Calculators <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Calculator Tools Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline text-foreground">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCalculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/calculators">
                View All Calculators <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* AI Features Highlight */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline text-foreground">Why Choose InvestAI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <CheckCircle className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-headline text-foreground">Intelligent Calculators</h3>
              <p className="text-muted-foreground">Precision tools for stocks, crypto, real estate, and more.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Bot className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-headline text-foreground">AI-Powered</h3>
              <p className="text-muted-foreground">Leverage AI for content, email validation, and chatbot assistance.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <CheckCircle className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-headline text-foreground">SEO Optimized Content</h3>
              <p className="text-muted-foreground">In-depth articles and guides to help you understand your investments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline text-foreground">Latest Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href={post.path}>
                  <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={post.dataAiHint}/>
                </Link>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">
                    <Link href={post.path} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0">
                   <Button variant="link" asChild className="px-0 text-primary">
                    <Link href={post.path}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link href="/blog">
                Visit Our Blog <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline text-foreground">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Image src={testimonial.avatarUrl} alt={testimonial.name} width={48} height={48} className="rounded-full mr-4" data-ai-hint={testimonial.dataAiHint}/>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.feedback}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-headline">Stay Updated</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto text-primary-foreground/90">
            Subscribe to our newsletter for the latest updates, investment tips, and new calculator releases.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-grow bg-background/20 placeholder-primary-foreground/70 border-primary-foreground/50 focus:bg-background/30 focus:border-primary-foreground text-primary-foreground" 
              aria-label="Email for newsletter"
            />
            <Button type="submit" variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
