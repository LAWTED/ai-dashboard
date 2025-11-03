"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { YellowBoxProviders } from "@/contexts/yellowbox-providers";
import { useYellowBoxAuth } from "@/contexts/yellowbox-auth-context";
import { useYellowBoxUI } from "@/contexts/yellowbox-ui-context";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { YellowBoxErrorBoundary } from "@/components/yellowbox/YellowBoxErrorBoundary";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { YellowBoxContainer } from "@/components/yellowbox/YellowBoxContainer";
import { RightSidePanel } from "@/components/yellowbox/RightSidePanel";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

// Shared sidebar component
function SharedSidebar() {
  const { handleLogout } = useYellowBoxAuth();
  const { currentFont, handleFontToggle, timeOfDay, setTimeOfDay } =
    useYellowBoxUI();
  const { lang, handleLanguageToggle, getLanguageTooltip, t } =
    useYellowBoxI18n();

  const handleTimeOfDayClick = (period: "morning" | "daytime" | "evening") => {
    setTimeOfDay(period);
  };

  return (
    <div className="absolute right-0 bottom-0 w-10 md:w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-2 md:py-4">
      {/* Time of day indicator dots (interactive) */}
      <div className="flex flex-col items-center space-y-1 md:space-y-2 mb-2 md:mb-4">
        <motion.div
          className={`size-1.5 rounded-full cursor-pointer ${
            timeOfDay === "morning" ? "bg-[#2AB186]" : "bg-black"
          }`}
          whileTap={{ scale: 1.5 }}
          transition={{ duration: 0.1 }}
          onClick={() => handleTimeOfDayClick("morning")}
          title="Morning"
        ></motion.div>
        <motion.div
          className={`w-1 h-8 md:h-12 rounded-full cursor-pointer ${
            timeOfDay === "daytime" ? "bg-[#2AB186]" : "bg-black"
          }`}
          whileTap={{ scaleX: 1.5 }}
          transition={{ duration: 0.1 }}
          onClick={() => handleTimeOfDayClick("daytime")}
          title="Daytime"
        ></motion.div>
        <motion.div
          className={`size-1.5 rounded-full cursor-pointer ${
            timeOfDay === "evening" ? "bg-[#2AB186]" : "bg-black"
          }`}
          whileTap={{ scale: 1.5 }}
          transition={{ duration: 0.1 }}
          onClick={() => handleTimeOfDayClick("evening")}
          title="Evening"
        ></motion.div>
      </div>

      {/* Font Switcher */}
      <Button
        onClick={handleFontToggle}
        className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-2 md:mb-3 p-0 h-auto bg-transparent border-none"
        title={`Current: ${
          currentFont === "serif"
            ? "Serif (Georgia)"
            : currentFont === "sans"
            ? "Sans (Inter)"
            : "Mono (Courier New)"
        }`}
        variant="ghost"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentFont}
            initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span
              className={`text-base md:text-lg font-medium ${
                currentFont === "serif"
                  ? "font-serif"
                  : currentFont === "sans"
                  ? "font-sans"
                  : "font-mono"
              }`}
            >
              Aa
            </span>
          </motion.div>
        </AnimatePresence>
      </Button>

      {/* Language Switcher */}
      <Button
        onClick={handleLanguageToggle}
        className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-2 md:mb-3 p-0 h-auto bg-transparent border-none"
        title={getLanguageTooltip()}
        variant="ghost"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={lang}
            initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span
              className={`text-base md:text-lg font-medium ${
                currentFont === "serif"
                  ? "font-serif"
                  : currentFont === "sans"
                  ? "font-sans"
                  : "font-mono"
              }`}
            >
              {lang === "zh" ? "中" : "En"}
            </span>
          </motion.div>
        </AnimatePresence>
      </Button>

      {/* Template Center Button */}
      <Link href="/yellowbox/templates">
        <Button
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-2 md:mb-3 p-0 h-auto bg-transparent border-none"
          title="Template Hub"
          variant="ghost"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1"
          >
            <Sparkles className="!w-4 !h-4 md:!w-5 md:!h-5" />
          </motion.div>
        </Button>
      </Link>

      {/* Logout button */}
      <Button
        onClick={handleLogout}
        className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
        title={t("logout") as string}
        variant="ghost"
      >
        <LogOut className="!w-4 !h-4 md:!w-5 md:!h-5" />
      </Button>
    </div>
  );
}

// Layout content component
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { getFontClass } = useYellowBoxUI();
  const pathname = usePathname();
  const isLoginPage = pathname === "/yellowbox/login";

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-black selection:bg-black selection:text-yellow-400 ${getFontClass()}`}
    >
      {/* Background Image - persistent */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/new-yellowbox-bg.jpg')",
        }}
        initial={false} // Prevent re-animation on navigation
        animate={{ opacity: 1 }}
      />

      {/* Content - conditional container */}
      <div className="relative z-10">
        {isLoginPage ? children : <YellowBoxContainer>{children}</YellowBoxContainer>}
      </div>

      {/* Right side panel */}
      <RightSidePanel />

      {/* Shared sidebar */}
      <SharedSidebar />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#FEF3C7',
            border: '2px solid #F59E0B',
            color: '#3B3109',
          },
        }}
      />
    </div>
  );
}

export default function YellowboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <YellowBoxErrorBoundary>
        <YellowBoxProviders>
          <LayoutContent>{children}</LayoutContent>
        </YellowBoxProviders>
      </YellowBoxErrorBoundary>
    </ReactQueryProvider>
  );
}
