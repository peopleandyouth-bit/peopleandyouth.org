import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://peopleandyouth.org"),

  title: {
    default: "People & Youth",
    template: "%s | People & Youth",
  },

  description:
    "At the Heart of Change 💙. India's youth-led digital institution for public policy, entrepreneurship, civic leadership and rural transformation.",

  keywords: [
    "People and Youth",
    "VNJCM",
    "Public Policy",
    "Dissent Dias",
    "Think Tank",
    "Youth",
    "India",
    "Rural Development",
    "Startup",
    "Leadership",
  ],

  authors: [{ name: "People & Youth" }],

  openGraph: {
    title: "People & Youth",
    description:
      "Leading Youth Towards Praxis.",
    url: "https://peopleandyouth.org",
    siteName: "People & Youth",
    images: [
      {
        url: "/images/profile picture.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "People & Youth",
    description: "At the Heart of Change 💙",
    images: ["/images/profile picture.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${playfair.variable} ${mono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}