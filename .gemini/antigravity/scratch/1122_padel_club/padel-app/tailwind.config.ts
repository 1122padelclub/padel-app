import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                padel: {
                    orange: "#F75C03", // Naranja 11
                    blue: "#041E42",   // Azul 22
                    darkblue: "#020F21", // Darker shade for contrast
                    teal: "#00B5E2",   // Light blue accent
                    white: "#FFFFFF",
                }
            },
            fontFamily: {
                sans: ["var(--font-barlow)", "sans-serif"],
                display: ["var(--font-teko)", "sans-serif"],
            },
        },
    },
    plugins: [],
} satisfies Config;
