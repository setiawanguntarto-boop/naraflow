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
  className = "",
}: SectionHeaderProps) => (
  <div className={`mb-16 ${centered ? "text-center" : ""} ${className}`}></div>
);
