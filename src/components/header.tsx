import { useState } from "react";
import { NaraflowLogo } from "./ui/icons";
import { Button } from "./ui/button-extended";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "./language-switcher";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { href: "#solutions", label: t('nav.solutions') },
    { href: "#how-it-works", label: t('nav.how-it-works') },
    { href: "#about", label: t('nav.about') },
    { href: "#pricing", label: t('nav.pricing') },
    { href: "#demo", label: t('nav.demo') },
    { href: "#faq", label: t('nav.faq') },
    { href: "#contact", label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border-light shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <NaraflowLogo />
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground-muted hover:text-brand-primary transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right side - Language switcher and CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="primary" asChild>
              <a href="#demo">{t('nav.try-demo')}</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground-muted hover:text-brand-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-border-light">
            <div className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-foreground-muted hover:text-brand-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button variant="primary" className="mt-4 w-full" asChild>
                <a href="#demo" onClick={() => setIsMenuOpen(false)}>{t('nav.try-demo')}</a>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};