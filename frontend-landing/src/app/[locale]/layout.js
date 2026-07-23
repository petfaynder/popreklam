import '../globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ToastProvider } from '@/components/Toast';
import CookieConsent from '@/components/CookieConsent';
import { Space_Grotesk, Outfit, Rajdhani, Playfair_Display, Inter } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-tech', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const RTL_LOCALES = ['ar'];

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: 'MrPop.io', url: 'https://mrpop.io',
  logo: { '@type': 'ImageObject', url: 'https://mrpop.io/logo.png', width: 200, height: 60 },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://mrpop.io/contact' },
};

export const metadata = {
  metadataBase: new URL('https://mrpop.io'),
  title: { default: 'MrPop.io — Premium Popunder & Push Ad Network', template: '%s | MrPop.io' },
  description: 'Monetize your website with MrPop.io — the high-CPM popunder and push ad network trusted by 10,000+ publishers. Earn up to $8 CPM with weekly payouts.',
  authors: [{ name: 'MrPop.io', url: 'https://mrpop.io' }],
  openGraph: {
    type: 'website', locale: 'en_US', url: 'https://mrpop.io', siteName: 'MrPop.io',
    title: 'MrPop.io — Premium Popunder & Push Ad Network',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MrPop.io' }],
  },
  twitter: { card: 'summary_large_image', site: '@mrpopio', images: ['/og-image.png'] },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${outfit.variable} ${rajdhani.variable} ${playfair.variable} ${inter.variable} antialiased selection:bg-primary selection:text-white transition-colors duration-500`}>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            {children}
            <CookieConsent />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
