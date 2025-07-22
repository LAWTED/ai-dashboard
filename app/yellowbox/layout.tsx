"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { YellowBoxProvider, useYellowBoxContext } from "@/contexts/yellowbox-context";

// Shared sidebar component
function SharedSidebar() {
  const { 
    currentFont, 
    lang, 
    handleLogout, 
    handleFontToggle, 
    handleLanguageToggle,
    getLanguageTooltip,
    t
  } = useYellowBoxContext();

  return (
    <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4">
      {/* Scroll indicator dots (static) */}
      <div className="flex flex-col items-center space-y-2 mb-4">
        <div className="size-1.5 rounded-full bg-black"></div>
        <div className="w-1 h-12 rounded-full bg-[#2AB186]"></div>
        <div className="size-1.5 rounded-full bg-black"></div>
      </div>

      {/* Font Switcher */}
      <Button
        onClick={handleFontToggle}
        className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
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
              className={`text-lg font-medium ${
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
        className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
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
              className={`text-lg font-medium ${
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

      {/* Logout button */}
      <Button
        onClick={handleLogout}
        className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
        title={t("logout") as string}
        variant="ghost"
      >
        <LogOut className="!w-5 !h-5" />
      </Button>
    </div>
  );
}

// Layout content component
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { getFontClass } = useYellowBoxContext();

  return (
    <div className={`min-h-screen relative overflow-hidden bg-black selection:bg-black selection:text-yellow-400 ${getFontClass()}`}>
      {/* Background Image - persistent */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/room.png')",
        }}
        initial={false} // Prevent re-animation on navigation
        animate={{ opacity: 1 }}
      />
      
      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shared sidebar */}
      <SharedSidebar />
    </div>
  );
}

export default function YellowboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <YellowBoxProvider>
      <LayoutContent>{children}</LayoutContent>
    </YellowBoxProvider>
  );
}