import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const inter = { variable: '' };
const playfair = { variable: '' };

export const metadata: Metadata = {
  title: "Wild Hausa | Connecting you to the wild",
  description: "A cinematic digital safari through conservation, culture, wildlife, and outdoor adventure in Northern Nigeria.",
  openGraph: {
    title: "Wild Hausa | Connecting you to the wild",
    description: "A cinematic digital safari through conservation, culture, wildlife, and outdoor adventure in Northern Nigeria.",
    siteName: "Wild Hausa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wild Hausa | Connecting you to the wild",
    description: "A cinematic digital safari through conservation, culture, wildlife, and outdoor adventure in Northern Nigeria.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-wild-cream">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

