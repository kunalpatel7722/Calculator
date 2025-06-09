import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-border py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="mb-2">
          <Link href="/legal" className="hover:text-primary transition-colors">
            Legal Disclaimers
          </Link>
        </p>
        <p>&copy; {currentYear} InvestAI. All rights reserved.</p>
        <p className="mt-2 text-xs">
          InvestAI provides AI-powered tools for informational purposes only and does not offer financial advice.
          AI predictions are based on historical data and models, and may not always be accurate.
          Consult with a qualified financial advisor before making investment decisions.
        </p>
      </div>
    </footer>
  );
}
