import "./globals.css";

import { Space_Grotesk, Outfit, Rajdhani, Playfair_Display, Inter } from "next/font/google"; // Added Fonts
import { ToastProvider } from "@/components/Toast";
import CookieConsent from "@/components/CookieConsent";


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
  // metadataBase is required for absolute OG/Twitter image URLs
  metadataBase: new URL('https://mrpop.io'),

  title: {
    default: 'MrPop.io — Premium Popunder & Push Ad Network',
    template: '%s | MrPop.io',
  },
  description:
    'Monetize your website with MrPop.io — the high-CPM popunder and push ad network trusted by 10,000+ publishers. Earn up to $8 CPM with weekly payouts. Advertisers reach millions with laser-targeted campaigns.',
  keywords: [
    'popunder ads', 'ad network', 'publisher monetization', 'CPM ads',
    'push notification ads', 'pop ads', 'website monetization', 'buy traffic',
    'popunder network', 'high CPM', 'in-page push', 'interstitial ads',
    'smart link', 'affiliate traffic', 'MrPop',
  ],
  authors: [{ name: 'MrPop.io', url: 'https://mrpop.io' }],
  creator: 'MrPop.io',
  publisher: 'MrPop.io',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mrpop.io',
    siteName: 'MrPop.io',
    title: 'MrPop.io — Premium Popunder & Push Ad Network',
    description:
      'High-CPM popunder & push ads for publishers. Targeted traffic for advertisers. Join 10,000+ publishers — weekly payouts, 100% fill rate.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MrPop.io — Premium Ad Network',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@mrpopio',
    creator: '@mrpopio',
    title: 'MrPop.io — Premium Popunder & Push Ad Network',
    description:
      'High-CPM popunder & push ads for publishers. Targeted traffic for advertisers.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Add your Google Search Console verification code here:
  // verification: { google: 'YOUR_GOOGLE_VERIFICATION_CODE' },
};

// Organization + WebSite structured data — injected globally for Google Knowledge Panel
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MrPop.io',
  url: 'https://mrpop.io',
  logo: {
    '@type': 'ImageObject',
    url: 'https://mrpop.io/logo.png',
    width: 200,
    height: 60,
  },
  description: 'Premium popunder and push notification ad network for publishers and advertisers worldwide.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://mrpop.io/contact',
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MrPop.io',
  url: 'https://mrpop.io',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://mrpop.io/blog?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${outfit.variable} ${rajdhani.variable} ${playfair.variable} ${inter.variable} antialiased selection:bg-primary selection:text-white transition-colors duration-500`}>
        <ToastProvider>
          {children}
          <CookieConsent />
        </ToastProvider>
      </body>
    </html>
  );
}

