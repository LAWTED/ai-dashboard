"use client";

import { Youtube, Apple, AirplayIcon as Spotify } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function YellowboxLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        toast.success("Check your email for the confirmation link");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Login successful");
        router.push("/yellowbox");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://freight.cargo.site/w/2689/h/2000/q/75/i/H2267809419218707714982209727068/Forest-Visitation.jpg')",
        }}
      />

      {/* Yellow Rounded Box */}
      <div className="absolute left-4 top-4 w-[520px] h-[500px] bg-yellow-400 rounded-2xl p-4 font-mono">
        <div className="flex items-center mb-1">
          <h1 className="text-5xl font-bold text-[#3B3109] leading-tight font-['IBM_Plex_Serif'] mr-3">
            Sign
          </h1>
          <AnimatePresence mode="wait">
            <motion.span
              key={isSignUp ? "up" : "in"}
              initial={{ y: isSignUp ? -20 : 20, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: isSignUp ? -20 : 20, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-5xl  font-bold text-[#3B3109] leading-tight font-['IBM_Plex_Serif']"
            >
              {isSignUp ? "up" : "in"}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Top divider line */}
        <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

        <div className="space-y-4">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="text-black text-sm">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none placeholder:text-black/25"
                style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="text-black text-sm">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none placeholder:text-black/25"
                style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                required
              />
            </div>

            {/* Error Message */}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Submit Button */}
            <div className="flex gap-2 items-center h-10">
              <AnimatePresence>
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
                      ? "Signing in..."
                      : isSignUp
                      ? "Sign Up"
                      : "Sign In"}
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
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="w-full h-px bg-[#E4BE10] my-2"></div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center gap-2">
          <div className="text-black text-sm cursor-pointer hover:underline">
            Login
          </div>
          <div className="text-black text-sm cursor-pointer hover:underline">
            Access
          </div>
        </div>
      </div>

      {/* Right Side Social Icons */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4 space-y-3">
        <Youtube className="w-5 h-5 text-black cursor-pointer hover:opacity-70" />
        <Apple className="w-5 h-5 text-black cursor-pointer hover:opacity-70" />
        <Spotify className="w-5 h-5 text-black cursor-pointer hover:opacity-70" />
      </div>
    </div>
  );
}
