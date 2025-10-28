import React from "react";

type ChickenProps = React.SVGProps<SVGSVGElement> & { className?: string };

export function Chicken(props: ChickenProps) {
  const { className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {/* Head */}
      <circle cx="15" cy="7" r="2" />
      {/* Beak */}
      <path d="M17 7l3 1-3 1" />
      {/* Comb */}
      <path d="M14 5l1-2 1 2" />
      {/* Body */}
      <path d="M5 12c0-2.761 3.239-5 7-5s7 2.239 7 5-3 6-7 6-7-3.239-7-6Z" />
      {/* Wing */}
      <path d="M9.5 12.5c1-.8 2.5-1 3.5 0 1 .9 1 2.4 0 3.2-1 .8-2.5.8-3.5 0" />
      {/* Tail */}
      <path d="M6 11l-2-2M6.5 13l-2.5-.5" />
      {/* Leg */}
      <path d="M12 18v3M12 21l-1.5-1M12 21l1.5-1" />
    </svg>
  );
}

export default Chicken;


