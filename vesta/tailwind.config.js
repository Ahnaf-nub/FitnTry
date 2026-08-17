/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F3EC",
        surface: "#FCFAF6",
        ink: {
          DEFAULT: "#15130F",
          soft: "#4A453D",
          faint: "#8A8377",
        },
        line: {
          DEFAULT: "#E4DFD3",
          strong: "#CFC8B8",
        },
        oxblood: {
          DEFAULT: "#6E1E28",
          light: "#8A2F3A",
          dark: "#4E1219",
        },
        camel: {
          DEFAULT: "#AC8A55",
          light: "#D9C7A3",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(21, 19, 15, 0.04), 0 8px 24px -12px rgba(21, 19, 15, 0.10)",
        lift: "0 20px 48px -16px rgba(21, 19, 15, 0.22)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "seam-sweep": {
          "0%": { transform: "translateX(-6%)" },
          "50%": { transform: "translateX(6%)" },
          "100%": { transform: "translateX(-6%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(110,30,40,0.28)" },
          "100%": { boxShadow: "0 0 0 10px rgba(110,30,40,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "seam-sweep": "seam-sweep 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};
