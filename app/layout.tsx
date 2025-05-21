import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Platform",
  description: "AI Platform Management System",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/Favicon64x64.png", sizes: "64x64" },
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
      <body>
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
