import "./globals.css";

import { Space_Grotesk, Outfit, Rajdhani, Playfair_Display, Inter } from "next/font/google"; // Added Fonts
import { ToastProvider } from "@/components/Toast";
import ThemeSwitcher from "@/components/ThemeSwitcher";

// Font Configuration
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-heading',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-body',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-tech',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: "PopReklam - The Anti-Boring Ad Network",
  description: "Monetize your traffic with high-impact popunder ads. No fluff, just revenue.",
  keywords: "pop ads, popunder, ad network, cpm, monetization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceGrotesk.variable} ${outfit.variable} ${rajdhani.variable} ${playfair.variable} ${inter.variable} antialiased selection:bg-primary selection:text-white transition-colors duration-500`}>
        <ToastProvider>
          {children}
        </ToastProvider>

        {/* Admin Theme Switcher */}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
