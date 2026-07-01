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
        "bg-deep": "#151A24",
        "bg-secondary": "#1E2430",
        "bg-surface": "#2A3242",
        "bg-elevated": "#364156",
        "border-default": "#475569",
        "text-main": "#F8FAFC",
        "text-muted": "#CBD5E1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
