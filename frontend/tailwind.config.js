/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6",
        "primary-hover": "#7C3AED",
        secondary: "#22D3EE",
        accent: "#FF4D8D",
        success: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        "priority-high": "#FF4D8D",
        "priority-medium": "#FBBF24",
        "priority-low": "#34D399",
        "bg-deep": "rgb(var(--color-bg-deep) / <alpha-value>)",
        "bg-secondary": "rgb(var(--color-bg-secondary) / <alpha-value>)",
        "bg-surface": "rgb(var(--color-bg-surface) / <alpha-value>)",
        "bg-elevated": "rgb(var(--color-bg-elevated) / <alpha-value>)",
        "border-default": "rgb(var(--color-border-default) / <alpha-value>)",
        "text-main": "rgb(var(--color-text-main) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
