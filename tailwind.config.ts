import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:     "#F8F8F8",
          dark:   "#232937",
          gold:   "#C6893F",
          "gold-light": "#D4A05A",
          "gold-dark":  "#A8722E",
          "dark-light": "#2E3649",
          "dark-muted": "#4A5568",
        },
      },
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
      animation: {
        "fade-up":   "fadeUp 0.6s ease-out forwards",
        "fade-in":   "fadeIn 0.5s ease-out forwards",
        "shimmer":   "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;