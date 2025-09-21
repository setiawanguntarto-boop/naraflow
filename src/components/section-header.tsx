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
    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 gradient-text">
      {title}
    </h2>
    {subtitle && (
      <p className="text-foreground-muted max-w-3xl mx-auto leading-relaxed text-lg">
        {subtitle}
      </p>
    )}
  </div>
);