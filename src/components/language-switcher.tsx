import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button-extended";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-surface-muted rounded-lg p-1">
      <Button
        variant={language === 'id' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('id')}
        className="text-xs px-3 py-1 h-8"
      >
        ID
      </Button>
      <Button
        variant={language === 'en' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-xs px-3 py-1 h-8"
      >
        EN
      </Button>
    </div>
  );
};