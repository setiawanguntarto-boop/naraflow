export const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.52 3.48A11.8 11.8 0 0012 0C5.37 0 .05 5.32.05 11.88c0 2.09.55 4.12 1.6 5.93L0 24l6.38-1.63a11.9 11.9 0 005.62 1.43h.01c6.63 0 11.95-5.32 11.95-11.88 0-3.18-1.26-6.17-3.44-8.44zM12 21.5c-1.77 0-3.5-.46-5.02-1.33l-.36-.21-3.78.97 1-3.68-.24-.38a9.25 9.25 0 01-1.45-4.98C2.15 6.4 6.59 2 12 2c2.57 0 4.98 1 6.8 2.81 1.81 1.8 2.82 4.19 2.82 6.73 0 5.4-4.44 9.96-9.96 9.96z"/>
    <path d="M17.1 14.2c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.48.1-.2.05-.36-.02-.51-.07-.15-.66-1.6-.91-2.2-.24-.58-.48-.5-.66-.51h-.57c-.19 0-.5.07-.76.36s-1 1-1 2.43 1.02 2.82 1.16 3.02c.15.2 2 3.15 4.85 4.41.68.29 1.21.46 1.62.59.68.22 1.29.19 1.78.11.54-.08 1.72-.7 1.97-1.37.24-.68.24-1.26.17-1.37-.08-.1-.26-.17-.54-.31z"/>
  </svg>
);

export const NaraflowLogo = ({ className = "h-10 w-10" }: { className?: string }) => (
  <div className="flex items-center gap-3">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="20"
        fill="url(#logoGradient)"
      />
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(270, 60%, 35%)" />
          <stop offset="100%" stopColor="hsl(270, 60%, 45%)" />
        </linearGradient>
      </defs>
      <path
        d="M30 75V25h10l30 35V25h10v50H70L40 40v35H30z"
        fill="white"
      />
    </svg>
    <span className="text-xl font-bold gradient-text">Naraflow</span>
  </div>
);

export const SendIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M2.01 21L23 12 2.01 3v7l15 2-15 2z"/>
  </svg>
);

export const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
);

export const SunIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);