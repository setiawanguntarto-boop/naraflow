interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader = ({ 
  title, 
  subtitle, 
  centered = true, 
  className = "" 
}: SectionHeaderProps) => (
  <div className={`mb-16 ${centered ? 'text-center' : ''} ${className}`}>
    <div className="bg-gradient-to-r from-brand-primary/5 via-brand-secondary/5 to-brand-primary/5 rounded-2xl py-10 px-8 shadow-soft border border-border-light">
      <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-4 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed text-lg">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);