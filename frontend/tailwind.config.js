/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        brand: {
          primary: "var(--brand-primary)",
          "primary-light": "var(--brand-primary-light)",
          secondary: "var(--brand-secondary)",
          success: "var(--brand-success)",
          warning: "var(--brand-warning)",
          danger: "var(--brand-danger)",
        },
        border: {
          subtle: "var(--border-subtle)",
          focus: "var(--border-focus)",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 1.8s infinite linear",
        "fade-in": "fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-up": "scaleUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
