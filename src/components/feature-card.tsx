import { ReactNode } from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  example?: string;
  className?: string;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  example,
  className = "",
}: FeatureCardProps) => (
  <div
    className={`group p-6 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 ${className}`}
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-brand-primary transition-colors">
      {title}
    </h3>
    <p className="text-foreground-muted leading-relaxed mb-4">{description}</p>
    {example && (
      <p className="text-sm text-brand-primary italic border-l-2 border-brand-primary pl-3">
        {example}
      </p>
    )}
  </div>
);
