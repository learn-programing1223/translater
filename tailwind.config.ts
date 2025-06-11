import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        primary: '#00E5A0',
        'primary-dim': '#00B37D',
        'primary-glow': '#00FFB3',
        background: '#0A0E1B',
        surface: '#111827',
        'surface-elevated': '#1F2937',
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-accent': '#00E5A0',
        secondary: '#94A3B8',
        'glass-bg': 'rgba(31, 41, 55, 0.4)',
        'glass-border': 'rgba(148, 163, 184, 0.1)',
        'glass-shadow': 'rgba(0, 229, 160, 0.1)',
        error: '#DC2626',
        success: '#10B981',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float-subtle 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 32px rgba(0, 229, 160, 0.3)',
        'premium': '0 0 0 1px rgba(0, 229, 160, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00E5A0 0%, #00B37D 100%)',
        'gradient-surface': 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00E5A0 0%, #00FFB3 50%, #00B37D 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0E1B 0%, #111827 100%)',
      },
    },
  },
  plugins: [],
}

export default config