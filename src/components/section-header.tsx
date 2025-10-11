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
  <div className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
    <h2 className="text-3xl font-extrabold text-brand-primary mb-2">
      {title}
    </h2>
    {subtitle && (
      <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed text-base">
        {subtitle}
      </p>
    )}
  </div>
);