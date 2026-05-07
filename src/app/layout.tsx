import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AccessControlProvider } from "@/providers/AccessControlProvider";
import AppChrome from "@/components/global/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frame the World",
  description: "Frame the World",
  icons: {
    icon: "/images/app_logo.png",
    shortcut: "/images/app_logo.png",
    apple: "/images/app_logo.png",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ReactQueryProvider>
          <AccessControlProvider>
            <AppChrome>{children}</AppChrome>
          </AccessControlProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
