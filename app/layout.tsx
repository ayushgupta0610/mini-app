import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Trivia | Farcaster Mini App",
  description: "Do you believe you were early to Web3? Let’s find out.",
  openGraph: {
    title: "Crypto Trivia",
    description: "Do you believe you were early to Web3? Let’s find out.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`],
    type: "website",
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="og:title" content="Crypto Trivia" />
        <meta
          name="og:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`}
        />
        <meta
          name="og:description"
          content="Do you believe you were early to Web3? Let’s find out."
        />
        <meta
          name="fc:frame"
          content={JSON.stringify({
            version: "next",
            imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`,
            button: {
              title: "Start Quiz",
              action: {
                type: "launch_frame",
                name: "Crypto Trivia",
                url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
                splashImageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/splash-image.png`,
                splashBackgroundColor: "#0a0a0a",
              },
            },
          })}
        />
        <meta name="og:type" content="website" />
        <meta name="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}`} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
