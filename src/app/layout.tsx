import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import ChatWidget from "@/components/chat/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shyamheritage.com"),
  title: "Shyam Heritage Palace | Luxury Hotel in Khatu Shyam Ji",
  description: "Book luxury hotel rooms in Khatu Shyam Ji at best price. Experience royal hospitality, free cancellation & instant confirmation near the temple.",
  keywords: ["Hotel in Khatu Shyam Ji", "Luxury Stay in Khatu", "Hotel near Khatu Shyam Temple", "Best Hotel in Khatu", "Shyam Heritage Palace", "Hotel Lord Krishna"],
  openGraph: {
    title: "Shyam Heritage Palace | Luxury Hotel in Khatu",
    description: "Experience royal hospitality at Shyam Heritage Palace. Luxury rooms, modern amenities, and just steps away from Khatu Shyam Ji Temple.",
    url: "https://shyamheritage.com",
    siteName: "Shyam Heritage Palace",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shyam Heritage Palace Luxury Room",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shyam Heritage Palace | Luxury Stay",
    description: "Book premium hotel rooms in Khatu Shyam Ji. Best rates & instant confirmation.",
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
  alternates: {
    canonical: "https://shyamheritage.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Shyam Heritage Palace",
  "alternateName": "Hotel Lord Krishna",
  "image": "https://shyamheritage.com/hotel-exterior.jpg",
  "description": "Experience royal hospitality at Shyam Heritage Palace, just steps away from Khatu Shyam Ji Temple.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "52, Bawan Bigha road, Behind Nagar Palika",
    "addressLocality": "Khatoo",
    "addressRegion": "Rajasthan",
    "postalCode": "332602",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 27.37,
    "longitude": 75.40
  },
  "url": "https://shyamheritage.com",
  "telephone": "+919950303198",
  "priceRange": "₹2000 - ₹8000",
  "checkinTime": "12:00",
  "checkoutTime": "11:00",
  "starRating": {
    "@type": "Rating",
    "ratingValue": "4.5"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          inter.variable,
          playfair.variable
        )}
      >
        <AuthProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Navbar />
          {children}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
