import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bot } from 'lucide-react'; // Bot icon for InvestAI logo

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/calculators', label: 'Calculators' },
  { href: '/blog', label: 'Blog' },
  { href: '/auth', label: 'Login/Signup' },
];

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary font-headline">
          <Bot className="h-7 w-7" />
          <span>InvestAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" asChild>
              <Link href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="p-4 border-b -mx-6 -mt-6 mb-4"> {/* Adjust padding to match original visual */}
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary font-headline">
                    <Bot className="h-6 w-6" />
                    <span>InvestAI Menu</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-2"> {/* Reduced top margin as SheetHeader now handles spacing */}
                {navLinks.map((link) => (
                  <Button key={link.href} variant="ghost" asChild className="w-full justify-start">
                    <Link href={link.href} className="text-base">
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
