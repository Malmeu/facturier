/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        "classic": {
          "primary": "#1f2937",
          "secondary": "#374151",
          "accent": "#3b82f6",
          "neutral": "#6b7280",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#e5e7eb",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272"
        }
      },
      {
        "modern": {
          "primary": "#6366f1",
          "secondary": "#8b5cf6",
          "accent": "#06b6d4",
          "neutral": "#64748b",
          "base-100": "#ffffff",
          "base-200": "#f1f5f9",
          "base-300": "#cbd5e1",
          "info": "#0ea5e9",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444"
        }
      },
      {
        "elegant": {
          "primary": "#b91c1c",
          "secondary": "#92400e",
          "accent": "#dc2626",
          "neutral": "#525252",
          "base-100": "#fefefe",
          "base-200": "#f5f5f5",
          "base-300": "#e5e5e5",
          "info": "#3b82f6",
          "success": "#059669",
          "warning": "#d97706",
          "error": "#dc2626"
        }
      },
      {
        "professional": {
          "primary": "#164e63",
          "secondary": "#0f766e",
          "accent": "#0891b2",
          "neutral": "#475569",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "info": "#0284c7",
          "success": "#0d9488",
          "warning": "#ea580c",
          "error": "#dc2626"
        }
      },
      {
        "creative": {
          "primary": "#7c3aed",
          "secondary": "#c026d3",
          "accent": "#ec4899",
          "neutral": "#6b7280",
          "base-100": "#ffffff",
          "base-200": "#faf5ff",
          "base-300": "#e9d5ff",
          "info": "#06b6d4",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#f43f5e"
        }
      },
      {
        "minimalist": {
          "primary": "#000000",
          "secondary": "#404040",
          "accent": "#666666",
          "neutral": "#808080",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e0e0e0",
          "info": "#2563eb",
          "success": "#16a34a",
          "warning": "#ca8a04",
          "error": "#dc2626"
        }
      },
      {
        "vibrant": {
          "primary": "#f59e0b",
          "secondary": "#ef4444",
          "accent": "#8b5cf6",
          "neutral": "#6b7280",
          "base-100": "#ffffff",
          "base-200": "#fef3c7",
          "base-300": "#fde68a",
          "info": "#06b6d4",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444"
        }
      },
      "light",
      "dark",
      "cupcake",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter"
    ]
  }
}