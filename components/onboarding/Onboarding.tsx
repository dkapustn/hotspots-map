"use client";
import { useEffect, useState } from "react";
import { MapPin, Camera, Footprints, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const KEY = "hotspots:onboarded:v1";

const SLIDES = [
  {
    icon: MapPin,
    title: "Карта крутых мест",
    text: "Открывай для себя классные лавочки, виды и необычные локации, которыми поделились другие.",
    color: "from-orange-400 to-rose-500",
  },
  {
    icon: Camera,
    title: "Делись находками",
    text: "Создавай метку с фото только там, где ты сам сейчас находишься. Никаких меток «из дивана».",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Footprints,
    title: "Подтверждай визиты",
    text: "Дошёл до места — нажми «Посетить». Приложение проверит, что ты действительно рядом.",
    color: "from-emerald-400 to-teal-500",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  }

  const slide = SLIDES[step]!;
  const Icon = slide.icon;
  const last = step === SLIDES.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-card">
        <div className="relative">
          <div className={`relative h-56 bg-gradient-to-br ${slide.color} flex items-center justify-center`}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)" }} />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0, rotate: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/95 shadow-2xl"
              >
                <Icon className="h-12 w-12 text-foreground" strokeWidth={2.2} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold tracking-tight">{slide.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{slide.text}</p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
                  aria-label={`Шаг ${i + 1}`}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1">
                  Назад
                </Button>
              )}
              <Button
                onClick={() => (last ? finish() : setStep(step + 1))}
                className="flex-1"
                size="lg"
              >
                {last ? (
                  <>
                    Поехали <Sparkles className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Дальше <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {step === 0 && (
              <button
                onClick={finish}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Пропустить
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
