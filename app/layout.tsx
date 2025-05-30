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
  description:
    "Test your crypto knowledge and discover when you should have entered the space!",
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`,
    "fc:frame:button:1": "Start Quiz",
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`,
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
        <meta property="og:title" content="Crypto Trivia" />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`}
        />
        <meta
          property="og:description"
          content="Test your crypto knowledge a nd discover when you should have entered the space!"
        />
        <meta
          property="fc:frame:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`}
        />
        <meta
          property="fc:frame:post_url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}`}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
