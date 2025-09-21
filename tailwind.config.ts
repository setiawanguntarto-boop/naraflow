import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // System Colors
        border: "hsl(var(--border))",
        "border-light": "hsl(var(--border-light))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        "background-soft": "hsl(var(--background-soft))",
        foreground: "hsl(var(--foreground))",
        "foreground-muted": "hsl(var(--foreground-muted))",
        "foreground-light": "hsl(var(--foreground-light))",
        
        // Brand Colors
        brand: {
          primary: "hsl(var(--brand-primary))",
          "primary-light": "hsl(var(--brand-primary-light))",
          "primary-glow": "hsl(var(--brand-primary-glow))",
          secondary: "hsl(var(--brand-secondary))",
          "secondary-light": "hsl(var(--brand-secondary-light))",
          accent: "hsl(var(--brand-accent))",
        },
        
        // Surface Colors
        surface: {
          primary: "hsl(var(--surface-primary))",
          "primary-foreground": "hsl(var(--surface-primary-foreground))",
          secondary: "hsl(var(--surface-secondary))",
          "secondary-foreground": "hsl(var(--surface-secondary-foreground))",
          muted: "hsl(var(--surface-muted))",
          "muted-foreground": "hsl(var(--surface-muted-foreground))",
        },
        
        // Interactive Colors
        interactive: {
          primary: "hsl(var(--interactive-primary))",
          "primary-hover": "hsl(var(--interactive-primary-hover))",
          secondary: "hsl(var(--interactive-secondary))",
          "secondary-hover": "hsl(var(--interactive-secondary-hover))",
          accent: "hsl(var(--interactive-accent))",
        },
        
        // Legacy Support
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--surface-primary))",
        "primary-foreground": "hsl(var(--surface-primary-foreground))",
        secondary: "hsl(var(--surface-secondary))",
        "secondary-foreground": "hsl(var(--surface-secondary-foreground))",
        muted: "hsl(var(--surface-muted))",
        "muted-foreground": "hsl(var(--surface-muted-foreground))",
        accent: "hsl(var(--interactive-accent))",
        "accent-foreground": "hsl(var(--surface-primary-foreground))",
      },
      
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
        "gradient-accent": "var(--gradient-accent)",
      },
      
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        strong: "var(--shadow-strong)",
        glow: "var(--shadow-glow)",
      },
      
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
