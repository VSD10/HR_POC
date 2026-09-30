/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      colors: {
        obsidian: "#060814",
        glass: {
          subtle: "rgba(255, 255, 255, 0.03)",
          card: "rgba(255, 255, 255, 0.05)",
          cardHover: "rgba(255, 255, 255, 0.08)",
          elevated: "rgba(255, 255, 255, 0.09)",
          border: "rgba(255, 255, 255, 0.12)",
          borderStrong: "rgba(255, 255, 255, 0.22)",
          highlight: "rgba(255, 255, 255, 0.28)"
        },
        neon: {
          cyan: "#00f0ff",
          violet: "#a855f7",
          cobalt: "#3b82f6",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b"
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-elevated': '0 20px 48px -12px rgba(0, 0, 0, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.35)',
        'neon-violet': '0 0 24px rgba(168, 85, 247, 0.35)',
        'neon-emerald': '0 0 16px rgba(16, 185, 129, 0.35)',
        'neon-rose': '0 0 16px rgba(244, 63, 94, 0.4)'
      }
    }
  },
  plugins: [],
}
