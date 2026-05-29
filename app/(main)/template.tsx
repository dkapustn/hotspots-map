"use client";
import { motion } from "framer-motion";

/**
 * template.tsx (в отличие от layout.tsx) пересоздаётся при каждом переходе,
 * поэтому идеально подходит для анимации появления страниц.
 * Лёгкое появление с подъёмом — едва заметно, но оживляет навигацию.
 */
export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
