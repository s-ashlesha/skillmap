/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        surface: {
          0: "#0a0a0f",
          1: "#111118",
          2: "#18181f",
          3: "#222230",
          4: "#2d2d40",
        },
        accent: {
          DEFAULT: "#6c63ff",
          bright: "#8b85ff",
          dim: "#4a44b3",
        },
        node: {
          tech: "#6c63ff",
          science: "#22d3ee",
          business: "#f59e0b",
          creative: "#ec4899",
          soft_skills: "#10b981",
        },
        border: "#ffffff14",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseSubtle: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
}
