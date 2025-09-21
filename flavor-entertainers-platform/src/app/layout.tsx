import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flavor Entertainers - Professional Performer Booking Platform",
  description: "Australia's premier platform for booking vetted professional performers for events. Musicians, dancers, comedians, magicians and more.",
  keywords: ["entertainment", "performers", "booking", "events", "australia"],
  authors: [{ name: "Flavor Entertainers" }],
  openGraph: {
    title: "Flavor Entertainers",
    description: "Book vetted professional performers for your events",
    url: "https://flavor-entertainers.com.au",
    siteName: "Flavor Entertainers",
    locale: "en_AU",
    type: "website",
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
