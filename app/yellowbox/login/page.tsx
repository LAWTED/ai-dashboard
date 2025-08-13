"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";
import { SlidingNumber } from "@/components/ui/sliding-number";

export default function YellowboxLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentFont, setCurrentFont] = useState<"serif" | "sans" | "mono">(
    "serif"
  );
  const [currentTime, setCurrentTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useYellowboxTranslation();

  useEffect(() => {
    const checkAuthAndSession = async () => {
      // Check URL parameters for password reset
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      const isRecovery = urlParams.get('type') === 'recovery' || urlHash.includes('type=recovery');
      const hasError = urlParams.get('error');
      
      console.log('URL check:', { 
        search: window.location.search, 
        hash: window.location.hash, 
        isRecovery,
        hasError 
      });

      // Show error if auth failed
      if (hasError === 'auth_failed') {
        setError('Authentication failed. Please try again.');
        return;
      }

      // Check for password reset session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (isRecovery) {
        if (session?.user) {
          console.log('Password reset session detected');
          setIsSettingNewPassword(true);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } else {
          console.log('Recovery URL but no session - redirecting to reset');
          setError('Session expired. Please request a new password reset.');
          return;
        }
      }

      // Regular auth check
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/yellowbox");
      }
    };
    
    checkAuthAndSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsSettingNewPassword(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

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

    setIsLoading(true);
    setError(null);

    try {
      if (isSettingNewPassword) {
        // Set new password flow
        if (!newPassword.trim()) {
          setError("New password is required");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (newPassword.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        toast.success("Password updated successfully!");
        router.push("/yellowbox");
      } else if (isResetPassword) {
        // Reset password flow
        if (!email.trim()) {
          setError(t("emailRequired") as string);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/yellowbox/login`,
        });

        if (error) throw error;
        toast.success(t("passwordResetSent") as string);
        setIsResetPassword(false);
      } else if (isSignUp) {
        if (!email.trim() || !password.trim()) return;

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
        if (!email.trim() || !password.trim()) return;

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
    <>
      {/* Yellow Rounded Box */}
      <div
        className={`absolute left-4 top-4 w-[640px]  bg-yellow-400 rounded-2xl p-4 ${getFontClass()}`}
      >
        <div className="flex items-center mb-1">
          {lang === "zh" ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={
                  isSettingNewPassword
                    ? "设置新密码"
                    : isResetPassword
                    ? "重置密码"
                    : isSignUp
                    ? "注册"
                    : "登入"
                }
                initial={{
                  y: -20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{
                  y: 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-5xl font-bold text-[#3B3109] leading-tight"
              >
                {isSettingNewPassword
                  ? "设置新密码"
                  : isResetPassword
                  ? "重置密码"
                  : isSignUp
                  ? "注册"
                  : "登入"}
              </motion.h1>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={
                  isSettingNewPassword
                    ? "Set New Password"
                    : isResetPassword
                    ? "Reset Password"
                    : isSignUp
                    ? "Sign up"
                    : "Sign in"
                }
                initial={{
                  y: -20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{
                  y: 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-5xl font-bold text-[#3B3109] leading-tight"
              >
                {isSettingNewPassword
                  ? "Set New Password"
                  : isResetPassword
                  ? "Reset Password"
                  : isSignUp
                  ? "Sign up"
                  : "Sign in"}
              </motion.h1>
            </AnimatePresence>
          )}
        </div>

        {/* Top divider line */}
        <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

        <div className="space-y-4">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input - hidden when setting new password */}
            {!isSettingNewPassword && (
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
            )}

            {/* Regular Password Input - hidden during reset or when setting new password */}
            {!isResetPassword && !isSettingNewPassword && (
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
            )}

            {/* New Password Inputs - shown when setting new password */}
            {isSettingNewPassword && (
              <>
                <div className="space-y-2">
                  <div className="text-black text-sm">New Password</div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none placeholder:text-black/25"
                    style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-black text-sm">Confirm Password</div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none placeholder:text-black/25"
                    style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                    required
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Submit Button */}
            <div className="flex gap-2 items-center h-10">
              <AnimatePresence initial={false}>
                {(isSettingNewPassword
                  ? newPassword.trim() && confirmPassword.trim()
                  : isResetPassword
                  ? email.trim()
                  : email.trim() && password.trim()) && (
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
                      ? isSettingNewPassword
                        ? "Updating..."
                        : isResetPassword
                        ? t("sending")
                        : t("signingIn")
                      : isSettingNewPassword
                      ? "Update Password"
                      : isResetPassword
                      ? t("sendResetEmail")
                      : isSignUp
                      ? t("signUpButton")
                      : t("signInButton")}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="text-center space-y-2">
            {isSettingNewPassword ? (
              <div className="text-black text-sm">
                Setting up your new password...
              </div>
            ) : !isResetPassword ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-black text-sm hover:underline block w-full"
                >
                  {isSignUp ? t("hasAccount") : t("noAccount")}
                </button>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-black text-sm hover:underline block w-full"
                  >
                    {t("forgotPassword")}
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(false);
                  setError(null);
                }}
                className="text-black text-sm hover:underline block w-full"
              >
                {t("backToSignIn")}
              </button>
            )}
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="w-full h-px bg-[#E4BE10] my-2"></div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center gap-2">
          <div className="text-black text-sm cursor-pointer">{t("login")}</div>
          <div className="text-black text-sm cursor-pointer flex items-center gap-1">
            <SlidingNumber value={currentTime.hours} padStart={true} />
            <span>:</span>
            <SlidingNumber value={currentTime.minutes} padStart={true} />
            <span>:</span>
            <SlidingNumber value={currentTime.seconds} padStart={true} />
          </div>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4 space-y-3">
        {/* Font Switcher */}
        <button
          onClick={handleFontToggle}
          className="text-black hover:opacity-70 transition-opacity"
          title={`Current: ${
            currentFont === "serif"
              ? "Serif (Georgia)"
              : currentFont === "sans"
              ? "Sans (Inter)"
              : "Mono (Courier New)"
          }`}
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
        </button>
      </div>
    </>
  );
}
