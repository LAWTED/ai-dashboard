import "../globals.css";
import type { Metadata } from "next";
import SplineScene from "@/app/social-journal/components/spline-scene";
import LogoutDrawer from "@/app/social-journal/components/logout-drawer";
import LoginDrawer from "@/app/social-journal/components/login-drawer";
import { Comic_Neue } from "next/font/google";

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comic-neue",
});

export const metadata: Metadata = {
  title: "社交日记 | Social Journal",
  description:
    "与朋友分享日常问题和回答的社交应用 | A social app for sharing daily questions and answers with friends",
  manifest: "/manifest.json",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "社交日记 | Social Journal",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="社交日记" />
        <link rel="apple-touch-icon" href="/social-journal.png" />
      </head>
      <body className={comicNeue.variable}>
        <div className="!h-[100dvh] fixed top-0 left-0 right-0 bottom-0 z-0">
          <SplineScene />
        </div>


        <div className="z-10 relative pointer-events-none ">{children}</div>

        {/* 登出 Drawer */}
        <LogoutDrawer />
        <LoginDrawer />
      </body>
    </html>
  );
}
