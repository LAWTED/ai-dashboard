import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Platform",
  description: "AI Platform Management System",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/Favicon64x64.png", sizes: "64x64" }
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <main className="flex-1 w-full overflow-y-hidden">
              <div className="flex items-center justify-between  p-2">
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
