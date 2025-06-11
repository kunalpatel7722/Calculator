
import type { LucideIcon } from 'lucide-react';
import { 
  TrendingUp, Activity, PieChart, Scale, Waves, Bitcoin, Repeat, Link2, Receipt, Rocket, 
  LayoutGrid, Landmark, Home, Target, Clock, CalendarDays, CalendarCheck2, TrendingDown, 
  ShieldCheck, Users, Wallet, Globe, Hourglass, LineChart, BarChart2, Banknote, Users2
} from 'lucide-react';

export interface CalculatorFeature {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  category: string;
  path: string;
  keywords: string[];
}

export const CALCULATOR_CATEGORIES = [
  "Stock Market",
  "Crypto",
  "General Investment",
  "Mutual Funds & SIP",
  "Retirement Planning",
  "Advanced Tools"
];

export const CALCULATORS_DATA: CalculatorFeature[] = [
  // Stock Market Calculators
  { id: 'compound-interest', name: 'Compound Interest Calculator', icon: TrendingUp, description: 'Project future value of investments with compounding.', category: 'Stock Market', path: '/calculators/compound-interest', keywords: ['compound interest', 'investment growth', 'finance'] },
  { id: 'stock-return', name: 'Stock Return Calculator', icon: Activity, description: 'Calculate profit or loss from stock investments.', category: 'Stock Market', path: '/calculators/stock-return', keywords: ['stock return', 'equity profit', 'investment analysis'] },
  { id: 'dividend-yield', name: 'Dividend Yield Calculator', icon: PieChart, description: 'Determine the dividend yield of a stock.', category: 'Stock Market', path: '/calculators/dividend-yield', keywords: ['dividend yield', 'stock dividend', 'passive income'] },
  { id: 'risk-reward-ratio', name: 'Risk/Reward Ratio Calculator', icon: Scale, description: 'Assess the risk vs. reward of an investment.', category: 'Stock Market', path: '/calculators/risk-reward-ratio', keywords: ['risk reward', 'trade analysis', 'investment strategy'] },
  { id: 'volatility', name: 'Volatility Calculator', icon: Waves, description: 'Measure the volatility of an investment.', category: 'Stock Market', path: '/calculators/volatility', keywords: ['volatility', 'stock risk', 'market fluctuation'] },

  // Crypto Calculators
  { id: 'bitcoin-roi', name: 'Bitcoin ROI Calculator', icon: Bitcoin, description: 'Calculate Return on Investment for Bitcoin.', category: 'Crypto', path: '/calculators/bitcoin-roi', keywords: ['bitcoin roi', 'crypto return', 'btc investment'] },
  { id: 'crypto-dca', name: 'Crypto DCA Calculator', icon: Repeat, description: 'Simulate Dollar Cost Averaging for crypto.', category: 'Crypto', path: '/calculators/crypto-dca', keywords: ['crypto dca', 'dollar cost averaging', 'bitcoin averaging'] },
  { id: 'blockchain-fee', name: 'Blockchain Fee Calculator', icon: Link2, description: 'Estimate blockchain transaction fees.', category: 'Crypto', path: '/calculators/blockchain-fee', keywords: ['blockchain fees', 'crypto transaction cost', 'gas fees'] },
  { id: 'crypto-tax', name: 'Crypto Tax Calculator', icon: Receipt, description: 'Estimate potential taxes on crypto gains.', category: 'Crypto', path: '/calculators/crypto-tax', keywords: ['crypto tax', 'bitcoin tax', 'cryptocurrency capital gains'] },
  { id: 'ico-ido-roi', name: 'ICO/IDO ROI Calculator', icon: Rocket, description: 'Calculate ROI for ICO/IDO investments.', category: 'Crypto', path: '/calculators/ico-ido-roi', keywords: ['ico roi', 'ido return', 'crypto launchpad'] },

  // General Investment Tools
  { id: 'portfolio-allocation', name: 'Portfolio Allocation Calculator', icon: LayoutGrid, description: 'Plan your asset allocation strategy.', category: 'General Investment', path: '/calculators/portfolio-allocation', keywords: ['portfolio allocation', 'asset distribution', 'investment diversification'] },
  { id: 'loan-vs-investment', name: 'Loan vs Investment Calculator', icon: Landmark, description: 'Compare paying off loans vs. investing.', category: 'General Investment', path: '/calculators/loan-vs-investment', keywords: ['loan vs investment', 'debt management', 'financial decisions'] },
  { id: 'real-estate-roi', name: 'Real Estate ROI Calculator', icon: Home, description: 'Calculate ROI for real estate investments.', category: 'General Investment', path: '/calculators/real-estate-roi', keywords: ['real estate roi', 'property investment', 'rental income'] },
  { id: 'goal-planning', name: 'Goal Planning Calculator', icon: Target, description: 'Plan investments to reach financial goals.', category: 'General Investment', path: '/calculators/goal-planning', keywords: ['goal planning', 'financial goals', 'investment targets'] },
  { id: 'time-value-of-money', name: 'Time Value of Money Calculator', icon: Clock, description: 'Understand the time value of money.', category: 'General Investment', path: '/calculators/time-value-of-money', keywords: ['time value of money', 'tvm', 'future value', 'present value'] },
  { id: 'currency-converter', name: 'Currency Converter', icon: Banknote, description: 'Convert amounts between currencies using placeholder exchange rates.', category: 'General Investment', path: '/calculators/currency-converter', keywords: ['currency converter', 'exchange rate', 'forex', 'money conversion'] },

  // Mutual Funds & SIP Calculators
  { id: 'sip-calculator', name: 'SIP Calculator', icon: CalendarDays, description: 'Project Systematic Investment Plan returns.', category: 'Mutual Funds & SIP', path: '/calculators/sip-calculator', keywords: ['sip calculator', 'systematic investment plan', 'mutual fund returns'] },
  { id: 'sip-vs-lumpsum', name: 'SIP vs Lumpsum Calculator', icon: CalendarCheck2, description: 'Compare SIP and lumpsum investment strategies.', category: 'Mutual Funds & SIP', path: '/calculators/sip-vs-lumpsum', keywords: ['sip vs lumpsum', 'investment comparison', 'mutual fund strategy'] },
  { id: 'swp-calculator', name: 'SWP Calculator', icon: TrendingDown, description: 'Plan Systematic Withdrawal Plan from investments.', category: 'Mutual Funds & SIP', path: '/calculators/swp-calculator', keywords: ['swp calculator', 'systematic withdrawal plan', 'retirement income'] },
  { id: 'elss-tax-saving', name: 'ELSS Tax Saving Calculator', icon: ShieldCheck, description: 'Calculate tax savings with ELSS mutual funds.', category: 'Mutual Funds & SIP', path: '/calculators/elss-tax-saving', keywords: ['elss calculator', 'tax saving mutual funds', 'section 80c'] },

  // Retirement Planning
  { id: 'retirement-corpus', name: 'Retirement Corpus Calculator', icon: Users, description: 'Estimate the corpus needed for retirement.', category: 'Retirement Planning', path: '/calculators/retirement-corpus', keywords: ['retirement corpus', 'pension planning', 'retirement fund'] },
  { id: 'annuity-calculator', name: 'Annuity Calculator', icon: Wallet, description: 'Calculate potential income from annuities.', category: 'Retirement Planning', path: '/calculators/annuity-calculator', keywords: ['annuity calculator', 'retirement annuity', 'pension income'] },

  // Advanced Tools
  { id: 'bear-market-survival', name: 'Bear Market Survival Calculator', icon: LineChart, description: 'Assess portfolio resilience in bear markets.', category: 'Advanced Tools', path: '/calculators/bear-market-survival', keywords: ['bear market', 'portfolio stress test', 'drawdown analysis'] },
  { id: 'global-allocation', name: 'Global Allocation Calculator', icon: Globe, description: 'Plan international investment allocation.', category: 'Advanced Tools', path: '/calculators/global-allocation', keywords: ['global allocation', 'international investing', 'currency risk'] },
  { id: 'market-timing-cost', name: 'Market Timing Cost Calculator', icon: Hourglass, description: 'Understand the cost of trying to time the market.', category: 'Advanced Tools', path: '/calculators/market-timing-cost', keywords: ['market timing', 'investment strategy', 'missed opportunity cost'] },
];

export function getCalculatorById(id: string): CalculatorFeature | undefined {
  return CALCULATORS_DATA.find(calc => calc.id === id);
}
