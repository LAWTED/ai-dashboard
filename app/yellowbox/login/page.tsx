"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";

export default function YellowboxLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentFont, setCurrentFont] = useState<"serif" | "sans" | "mono">("serif");
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useYellowboxTranslation();


  const handleFontToggle = () => {
    if (currentFont === "serif") {
      setCurrentFont("sans");
    } else if (currentFont === "sans") {
      setCurrentFont("mono");
    } else {
      setCurrentFont("serif");
    }
  };

  const getFontClass = () => {
    switch (currentFont) {
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-serif";
    }
  };

  const handleLanguageToggle = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  const getLanguageTooltip = () => {
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/yellowbox`,
          },
        });

        if (error) throw error;
        toast.success(t("checkEmail") as string);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success(t("loginSuccess") as string);
        router.push("/yellowbox");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : (t("anErrorOccurred") as string)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/room.png')",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* Yellow Rounded Box */}
      <div
        className={`absolute left-4 top-4 w-[540px] bg-yellow-400 rounded-2xl p-4 ${getFontClass()}`}
      >
        <div className="flex items-center mb-1">
          {lang === "zh" ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={isSignUp ? "注册" : "登入"}
                initial={{
                  y: isSignUp ? -20 : 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{
                  y: isSignUp ? -20 : 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-5xl font-bold text-[#3B3109] leading-tight"
              >
                {isSignUp ? "注册" : "登入"}
              </motion.h1>
            </AnimatePresence>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-[#3B3109] leading-tight mr-3">
                Sign
              </h1>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isSignUp ? "up" : "in"}
                  initial={{
                    y: isSignUp ? -20 : 20,
                    opacity: 0,
                    filter: "blur(4px)",
                  }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{
                    y: isSignUp ? -20 : 20,
                    opacity: 0,
                    filter: "blur(4px)",
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-5xl font-bold text-[#3B3109] leading-tight"
                >
                  {isSignUp ? "up" : "in"}
                </motion.span>
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Top divider line */}
        <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

        <div className="space-y-4">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="text-black text-sm">{t("email")}</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder") as string}
                className="w-full p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none placeholder:text-black/25"
                style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="text-black text-sm">{t("password")}</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder") as string}
                className="w-full p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none placeholder:text-black/25"
                style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                required
              />
            </div>

            {/* Error Message */}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Submit Button */}
            <div className="flex gap-2 items-center h-10">
              <AnimatePresence initial={false}>
                {email.trim() && password.trim() && (
                  <motion.button
                    initial={{
                      opacity: 0,
                      filter: "blur(4px)",
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(4px)",
                      x: -20,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    type="submit"
                    disabled={isLoading}
                    className="px-4 rounded-lg bg-transparent text-black text-sm disabled:opacity-50 disabled:cursor-not-allowed h-8"
                    style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                  >
                    {isLoading
                      ? t("signingIn")
                      : isSignUp
                      ? t("signUpButton")
                      : t("signInButton")}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-black text-sm hover:underline"
            >
              {isSignUp ? t("hasAccount") : t("noAccount")}
            </button>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="w-full h-px bg-[#E4BE10] my-2"></div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center gap-2">
          <div className="text-black text-sm cursor-pointer hover:underline">
            {t("login")}
          </div>
          <div className="text-black text-sm cursor-pointer hover:underline">
            {t("access")}
          </div>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4 space-y-3">
        {/* Font Switcher */}
        <button
          onClick={handleFontToggle}
          className="text-black hover:opacity-70 transition-opacity"
          title={`Current: ${currentFont === "serif" ? "Serif (Georgia)" : currentFont === "sans" ? "Sans (Inter)" : "Mono (Courier New)"}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentFont}
              initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span className={`text-lg font-medium ${
                currentFont === "serif" ? "font-serif" :
                currentFont === "sans" ? "font-sans" : "font-mono"
              }`}>
                Aa
              </span>
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Language Switcher */}
        <button
          onClick={handleLanguageToggle}
          className="text-black hover:opacity-70 transition-opacity"
          title={getLanguageTooltip()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={lang}
              initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span className={`text-lg font-medium ${
                currentFont === "serif" ? "font-serif" :
                currentFont === "sans" ? "font-sans" : "font-mono"
              }`}>
                {lang === "zh" ? "中" : "En"}
              </span>
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
