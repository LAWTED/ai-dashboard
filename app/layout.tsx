import "./globals.css";
import { Urbanist } from "next/font/google";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`bg-background ${urbanist.variable}`}>
      <body
        className="bg-background"
        style={{ fontFamily: urbanist.style.fontFamily }}
      >
        {children}
      </body>
    </html>
  );
}
