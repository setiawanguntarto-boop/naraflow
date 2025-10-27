import { useState } from "react";
import { Link } from "react-router-dom";
import { NaraflowLogo } from "./ui/icons";
import { Button } from "./ui/button-extended";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "./language-switcher";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { LlamaConnectionPanel } from "./LlamaConnectionPanel";
import { ResponsibleAIPanel } from "./Settings/ResponsibleAIPanel";
import { Shield, Wifi, WifiOff, Loader2 } from "lucide-react";
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLlamaPanel, setShowLlamaPanel] = useState(false);
  const [showResponsibleAIPanel, setShowResponsibleAIPanel] = useState(false);
  const {
    t
  } = useLanguage();
  const { llamaConfig } = useWorkflowState();
  const navItems = [{
    href: "/about",
    label: t('nav.about'),
    isAnchor: false
  }, {
    href: "/how-it-works",
    label: t('nav.how-it-works'),
    isAnchor: false
  }, {
    href: "/workflow-studio",
    label: "Workflow Studio",
    isAnchor: false
  }, {
    href: "/pricing",
    label: t('nav.pricing'),
    isAnchor: false
  }, {
    href: "/faq",
    label: t('nav.faq'),
    isAnchor: false
  }];
  const solutionsDropdown = {
    farm: [{
      name: "Rahayu",
      icon: "🐔",
      desc: "Broiler Farm Workflow",
      link: "https://tanyarahayu.com/"
    }, {
      name: "Tambakflow",
      icon: "🦐",
      desc: "Shrimp Farm Workflow",
      link: "https://tambak.naraflow.id"
    }, {
      name: "Kasaflow",
      icon: "🌿",
      desc: "Cassava Trading Workflow",
      link: "https://kasaflow.lovable.app/"
    }],
    field: [{
      name: "Rodaya",
      icon: "🏍️",
      desc: "FMCG Distribution Workflow",
      link: "https://rodaya.naraflow.id/"
    }, {
      name: "Tamara",
      icon: "🏨",
      desc: "Hospitality Workflow",
      link: "https://tamara.naraflow.id/"
    }, {
      name: "Sortify",
      icon: "♻️",
      desc: "Waste Management",
      link: "#"
    }]
  };
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border-light shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="cursor-pointer">
            <NaraflowLogo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Solutions Dropdown */}
            <div className="relative group">
              
              
              <div className="absolute hidden group-hover:block bg-background shadow-lg rounded-xl mt-3 w-80 border border-border right-0 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm uppercase tracking-wide text-foreground-muted font-semibold mb-2">Farm as a Service</h3>
                  <ul className="space-y-2">
                    {solutionsDropdown.farm.map(item => <li key={item.name}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-foreground hover:text-brand-primary transition">
                          <span className="mr-2">{item.icon}</span> {item.name} — {item.desc}
                        </a>
                      </li>)}
                  </ul>
                </div>
                
                <div className="px-4 py-3">
                  <h3 className="text-sm uppercase tracking-wide text-foreground-muted font-semibold mb-2">Field Workflow Solutions</h3>
                  <ul className="space-y-2">
                    {solutionsDropdown.field.map(item => <li key={item.name}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-foreground hover:text-brand-primary transition">
                          <span className="mr-2">{item.icon}</span> {item.name} — {item.desc}
                        </a>
                      </li>)}
                  </ul>
                </div>
              </div>
            </div>
            
            {navItems.map(item => item.isAnchor ? <a key={item.href} href={item.href} className="text-foreground-muted hover:text-brand-primary transition-colors font-medium">
                  {item.label}
                </a> : <Link key={item.href} to={item.href} className="text-foreground-muted hover:text-brand-primary transition-colors font-medium">
                  {item.label}
                </Link>)}
          </nav>

          {/* Right side - Language switcher, LLaMA status, and CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            
            {/* LLaMA Status Indicator */}
            <button
              onClick={() => setShowLlamaPanel(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                llamaConfig.llamaStatus === 'connected' 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : llamaConfig.llamaStatus === 'checking'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {llamaConfig.llamaStatus === 'checking' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : llamaConfig.llamaStatus === 'connected' ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {llamaConfig.mode === 'local' ? 'Local LLaMA' : 'Cloud LLaMA'}
            </button>

            {/* Responsible AI Button */}
            <button
              onClick={() => setShowResponsibleAIPanel(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              <Shield className="w-3 h-3" />
              AI Ethics
            </button>
            
            <Button variant="primary" asChild>
              <Link to="/contact">{t('nav.contact')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher />
            <button className="p-2 text-foreground-muted hover:text-brand-primary transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <nav className="lg:hidden mt-4 pb-4 border-t border-border-light">
            <div className="flex flex-col space-y-4 mt-4">
              {navItems.map(item => item.isAnchor ? <a key={item.href} href={item.href} className="text-foreground-muted hover:text-brand-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </a> : <Link key={item.href} to={item.href} className="text-foreground-muted hover:text-brand-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </Link>)}
              <Button variant="primary" className="mt-4 w-full" asChild>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>{t('nav.contact')}</Link>
              </Button>
            </div>
          </nav>}
      </div>

      {/* LLaMA Connection Panel */}
      <LlamaConnectionPanel
        open={showLlamaPanel}
        onOpenChange={setShowLlamaPanel}
      />

      {/* Responsible AI Panel */}
      <ResponsibleAIPanel
        open={showResponsibleAIPanel}
        onOpenChange={setShowResponsibleAIPanel}
      />
    </header>;
};