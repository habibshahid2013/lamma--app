import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#0D7377", // Primary
          deep: "#1D4E5F",
          light: "#E6F4F4",
        },
        gold: {
          DEFAULT: "#F5B820", // Warm Gold
          light: "#FEF9E7",
        },
        gray: {
          dark: "#333333", // Body text
          offwhite: "#FAFAFA", // Card backgrounds
        },
      },
    },
  },
  plugins: [],
};
export default config;
