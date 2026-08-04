import { motion } from "framer-motion";
import Logo from "@/components/layout/Logo";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-green-700 via-emerald-800 to-green-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="relative"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-full bg-white/10 p-2 shadow-2xl"
        >
          <Logo size={88} className="ring-4 ring-white/30" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-5"
      >
        <span className="text-white font-extrabold text-2xl tracking-tight">
          Flint Eats
        </span>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-1 text-green-200 text-sm mobile-label-ok"
      >
        Nourishing our community
      </motion.span>
    </motion.div>
  );
}