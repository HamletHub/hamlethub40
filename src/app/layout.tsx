import Footer from "@/app/_components/footer";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";
import { Vollkorn } from 'next/font/google';
import { Lexend_Deca } from 'next/font/google';

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Use environment variable with fallback
const HOME_OG_IMAGE_URL = process.env.NEXT_PUBLIC_HOME_OG_IMAGE_URL || "/images/og-image.jpg";

export const metadata: Metadata = {
  title: `HamletHub Local Stories`,
  description: `Celebrating the people, places and things that make our community great`,
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
};

const vollkorn = Vollkorn({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Add weights you need
  variable: '--font-vollkorn', // This creates a CSS variable
  display: 'swap',
});

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-lexend-deca',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={vollkorn.variable}>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      </head>
      <body
        className={cn(
          lexendDeca.variable, // Use Lexend Deca as the primary font
          inter.variable, // Optional: Include Inter as a fallback
          'font-sans dark:bg-slate-900 dark:text-slate-400'
        )}
      >
        <div className="min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            {children}
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
