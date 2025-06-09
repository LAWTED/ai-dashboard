"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import "./globals.css";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Londrina_Solid, Shantell_Sans } from "next/font/google";

const londrinaSolid = Londrina_Solid({
  subsets: ["latin"],
  weight: ["400", "300", "900"],
  variable: "--font-londrina-solid",
});

const shantellSans = Shantell_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-shantell-sans",
});

// export const metadata: Metadata = {
//   title: "AI Platform",
//   description: "AI Platform Management System",
//   icons: {
//     icon: [
//       { url: "/favicon.ico", sizes: "any" },
//       { url: "/Favicon64x64.png", sizes: "64x64" },
//     ],
//     apple: "/apple-touch-icon.png",
//   },
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.includes("pua-game-mobile")) {
    return (
      <html lang="en">
        <body
          className={`${londrinaSolid.variable} ${shantellSans.variable}`}
        >
          {children}
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <body className={`${londrinaSolid.variable} ${shantellSans.variable}`}>
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-dvh w-full">
            <AppSidebar />
            <main className="flex-1 w-full overflow-y-hidden">
              <div className="absolute top-3 left-3 z-10">
                <SidebarTrigger />
              </div>
              {children}
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
