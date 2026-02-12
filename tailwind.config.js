/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0e1a",
          secondary: "#111827",
          card: "#1a2035",
        },
        accent: {
          red: "#DC2626",
          orange: "#EA580C",
          yellow: "#CA8A04",
          green: "#65A30D",
          blue: "#3B82F6",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        display: ['"DM Sans"', "sans-serif"],
        body: ['"Source Sans 3"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
