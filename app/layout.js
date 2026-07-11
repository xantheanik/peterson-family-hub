import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/app/components/SiteFooter";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "Peterson Family Hub",
  description:
    "One shared calendar for every generation of the Peterson family.",
  appleWebApp: {
    capable: true,
    title: "Family Hub",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#202a41",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable}`}>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
