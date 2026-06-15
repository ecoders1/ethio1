import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Exit Exam Ethiopia | Prepare Today, Succeed Tomorrow",
    template: "%s | Exit Exam Ethiopia",
  },
  description:
    "Ethiopia's premier exit exam preparation platform. Practice questions, mock exams, and performance tracking for all university departments.",
  keywords: [
    "exit exam ethiopia",
    "ethiopia university exit exam",
    "exit exam preparation",
    "ethiopian students",
    "mock exam",
    "practice questions",
  ],
  authors: [{ name: "Exit Exam Ethiopia" }],
  creator: "Exit Exam Ethiopia",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://exitexam.ethiopia.et",
    title: "Exit Exam Ethiopia",
    description: "Prepare Today, Succeed Tomorrow",
    siteName: "Exit Exam Ethiopia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exit Exam Ethiopia",
    description: "Prepare Today, Succeed Tomorrow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(15, 15, 30, 0.9)",
                color: "#f8fafc",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                backdropFilter: "blur(16px)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#8b5cf6", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
