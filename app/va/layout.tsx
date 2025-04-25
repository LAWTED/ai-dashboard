import { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "./va-styles.css";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Values Affirmation (VA) Module",
  description: "An open-source, plug-and-play Values Affirmation intervention inspired by Geoffrey Cohen's work.",
};

export default function VALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} font-sans min-h-screen bg-white text-gray-900`}>
      {children}
    </div>
  );
}