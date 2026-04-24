/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#060e20",
          darker: "#040a18",
          card: "#111827",
          "card-hover": "#1a2332",
          border: "rgba(255,255,255,0.08)",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #4edea3 0%, #06b6d4 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(22,30,50,0.85) 0%, rgba(15,22,40,0.92) 100%)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(78, 222, 163, 0.15)",
        "glow-lg": "0 0 40px rgba(78, 222, 163, 0.25)",
      },
    },
  },
  plugins: [],
}
