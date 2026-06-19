import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      colors: {
        bee: {
          50: "#fff8db",
          100: "#ffed99",
          400: "#ffc400",
          500: "#f6b800",
          600: "#c89000",
        },
        ink: "#1d1d1f",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15,23,42,.10)",
        card: "0 1px 0 rgba(15,23,42,.05), 0 18px 44px rgba(15,23,42,.08)",
      },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
    },
  },
  plugins: [],
};
export default config;
