import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google'
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { NotificationProvider } from "../components/ui/notification-context";
import ConditionalLayoutWrapper from "../components/conditional-layout-wrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "ClipExplain - AI-Powered Video Explanations",
  description: "Upload any movie clip, TV show scene, or music video and get detailed AI-powered explanations. Understand what you just watched with intelligent insights and analysis.",
  keywords: "video explanation, AI analysis, movie clips, TV shows, music videos, content understanding, AI assistant",
  authors: [{ name: "ClipExplain Team" }],
  creator: "ClipExplain",
  publisher: "ClipExplain",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cineexplain.com'),
  openGraph: {
    title: "ClipExplain - AI-Powered Video Explanations",
    description: "Upload any movie clip, TV show scene, or music video and get detailed AI-powered explanations. Understand what you just watched with intelligent insights and analysis.",
    url: 'https://cineexplain.com',
    siteName: 'ClipExplain',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'ClipExplain - AI Video Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ClipExplain - AI-Powered Video Explanations",
    description: "Upload any movie clip, TV show scene, or music video and get detailed AI-powered explanations.",
    images: ['/logo.png'],
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#6366f1' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <NotificationProvider>
            <ConditionalLayoutWrapper>
              {children}
            </ConditionalLayoutWrapper>
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
