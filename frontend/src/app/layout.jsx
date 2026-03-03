import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import LoadingScreen from "@/components/LoadingScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://oryzalokabasa.com"),
  title: {
    default:
      "Oryza Lokabasa - Komunitas Seni, Bahasa & Budaya Nusantara",
    template: "%s | Oryza Lokabasa",
  },
  description:
    "Oryza Lokabasa adalah komunitas seni dan budaya yang mengolah bahasa, sastra, dan seni pertunjukan sebagai ruang dialog antar tradisi dan zaman.",
  keywords: [
    "komunitas budaya Indonesia",
    "seni pertunjukan",
    "bahasa dan sastra",
    "pelestarian budaya",
    "Oryza Lokabasa",
  ],
  authors: [{ name: "Oryza Lokabasa" }],
  openGraph: {
    title:
      "Oryza Lokabasa - Komunitas Seni, Bahasa & Budaya Nusantara",
    description:
      "Merawat warisan Nusantara melalui bahasa, sastra, dan seni pertunjukan.",
    url: "https://oryzalokabasa.com",
    siteName: "Oryza Lokabasa",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Oryza Lokabasa",
      },
    ],
  },
  icons: {
    icon: "/Logo-2.png",
    apple: "/Logo-2.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <LoadingScreen />
        <LanguageProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
