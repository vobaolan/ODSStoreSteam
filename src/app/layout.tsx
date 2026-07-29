import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ODS | Odyssey Store",
    template: "%s | ODS | Odyssey Store",
  },
  description: "Cửa hàng bán Key và Tài khoản game Steam, Epic, EA tự động, uy tín hàng đầu ODS | Odyssey Store. Giao key tức thì và thanh toán tự động 24/7.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

import ChatbotWidget from '@/components/ChatbotUI';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} font-sans bg-ods-bg text-ods-textMain antialiased selection:bg-ods-primary selection:text-white`}
      >
        <Providers>
          {children}
        </Providers>
        <ChatbotWidget />
      </body>
    </html>
  );
}
