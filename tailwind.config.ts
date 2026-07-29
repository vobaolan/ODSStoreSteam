import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ods: {
          bg: "#FFFFFF",          // Nền chính (White Canvas)
          card: "#FFFFFF",        // Nền thẻ trắng tinh
          cardHover: "#F9FAFB",   // Nền thẻ hover xám rất nhẹ
          border: "#E5E7EB",      // Viền xám mảnh (NZXT Iron)
          borderActive: "#0099FF",// Viền active/hover xanh dương Sky Blue
          primary: "#0099FF",     // Xanh dương Sky Blue chính làm điểm nhấn thương hiệu
          primaryHover: "#0077D6",
          accent: "#DBE800",      // Vàng Neon Volt (lấy cảm hứng từ NZXT Light)
          accentHover: "#C4D000",
          textMain: "#000000",    // Chữ chính đen tuyền
          textMuted: "#4B5563",   // Chữ phụ xám đậm
          surface: "#F3F4F6",     // Nền phụ xám nhạt (chứa ảnh game)
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      borderRadius: {
        ods: "12px", // Bo góc mềm mại giống các thiết bị mới của NZXT
      },
      boxShadow: {
        skyGlow: "0 8px 30px rgba(0, 153, 255, 0.12)",
        voltGlow: "0 8px 30px rgba(219, 232, 0, 0.12)",
        buttonGlow: "0 4px 15px rgba(0, 153, 255, 0.2)",
        lightShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
