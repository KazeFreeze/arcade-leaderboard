/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 1. Define a new 'arcade' font family that uses the CSS variable
        // from layout.tsx. This replaces 'press-start'.
        arcade: ["var(--font-vt323)", "monospace"],
      },
      colors: {
        "arcade-blue": "#00ffff",
        "arcade-purple": "#ff00ff",
        "arcade-bg": "#0a0a0a",
      },
      boxShadow: {
        "arcade-glow":
          "0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 20px #ff00ff, 0 0 30px #ff00ff",
      },
    },
  },
  plugins: [],
};
