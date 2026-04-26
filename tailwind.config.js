/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        slate: "#121722",
        steel: "#90a4c7",
        glow: "#38bdf8",
        ember: "#f97316"
      },
      boxShadow: {
        glass: "0 10px 40px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "hero-noise": "radial-gradient(circle at 20% 10%, rgba(56, 189, 248, 0.18), transparent 30%), radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.12), transparent 35%), linear-gradient(165deg, #05070c 0%, #0b1020 45%, #111827 100%)"
      }
    }
  },
  plugins: []
};
