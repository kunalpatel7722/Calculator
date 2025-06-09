import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-headline">Legal Disclaimers & Information</h1>
        <p className="text-xl text-muted-foreground">
          Important information regarding the use of InvestAI services and AI-powered tools.
        </p>
      </header>

      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Info className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">General Information</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>InvestAI provides financial calculators and AI-generated content for informational and educational purposes only. The information provided on this website should not be considered as financial advice, investment recommendations, or an offer or solicitation to buy or sell any securities or financial instruments.</p>
            <p>All tools, calculations, and content are provided "as is" without any warranties, express or implied. Your use of this website and its tools is at your own risk.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="font-headline text-2xl">AI Limitations & Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Our platform utilizes Artificial Intelligence (AI) to power certain features, including content generation, email validation, chatbot assistance, and predictive analytics. While we strive for accuracy, AI models have limitations:</p>
            <ul>
              <li>AI-generated content and predictions are based on historical data, algorithms, and patterns. They may not always be accurate, complete, or up-to-date.</li>
              <li>Financial markets are inherently volatile and influenced by numerous unpredictable factors. AI predictions cannot foresee all market changes or black swan events.</li>
              <li>The AI chatbot may provide information based on its training data and web searches. It is not a substitute for professional financial advice, and its responses should be independently verified.</li>
              <li>AI email validation aims to improve data quality but cannot guarantee 100% accuracy in identifying all invalid or disposable email addresses.</li>
            </ul>
            <p><strong>Do not solely rely on AI-generated information for making financial decisions.</strong> Always conduct your own thorough research and consider consulting with a qualified financial advisor.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline text-2xl">No Financial Advice</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>InvestAI is not a registered investment advisor, broker-dealer, or financial planner. The content and tools provided on this website do not constitute financial, investment, legal, or tax advice.</p>
            <p>Any decisions you make based on information from this website are your sole responsibility. We strongly recommend seeking advice from qualified professionals tailored to your individual financial situation before making any investment decisions.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Info className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Risk Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>All investments involve risk, including the possible loss of principal. Past performance is not indicative of future results. The value of investments can go down as well as up.</p>
            <p>Cryptocurrency investments are particularly volatile and carry a high degree of risk. You should be prepared to lose your entire investment in cryptocurrencies.</p>
            <p>Before investing, carefully consider your investment objectives, risk tolerance, and financial circumstances.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Info className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Data Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>While InvestAI strives to provide accurate and up-to-date information, we do not warrant the accuracy, completeness, or timeliness of any data or content on the website. Market data may be delayed or contain errors.</p>
            <p>Users are responsible for verifying any information before relying on it.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Info className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>InvestAI reserves the right to modify these disclaimers and terms of use at any time without prior notice. Your continued use of the website following any changes constitutes your acceptance of the new terms.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
