"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import Link from "next/link";

export default function StudentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Main Welcome Message */}
          <motion.h1
            className="font-londrina text-6xl md:text-8xl font-bold text-indigo-600 dark:text-indigo-400 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Welcome to
          </motion.h1>

          {/* Grad Cafe Title */}
          <motion.h2
            className="font-londrina text-4xl md:text-6xl font-bold text-slate-800 dark:text-slate-200 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Grad Cafe
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            Your academic journey starts here. Connect, learn, and grow with fellow graduate students.
          </motion.p>

          {/* Call to Action */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
            >
            <Link href="/student/cafe">
              <motion.div
              whileHover={{
                scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-londrina text-xl font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                >
                  <Coffee className="h-5 w-5" />
                  Enter Professor Cafe
                </Button>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="font-londrina text-xl font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                Explore Features
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}