import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'

const QUOTES = [
  { text: "A generation that contributes together can transform the future together.", by: "Prachetas Foundation" },
  { text: "Young minds. Shared responsibility. Lasting impact.", by: "COEP Internship 2026" },
  { text: "More than fundraising — this is a movement for a better tomorrow.", by: "Campaign Motto" },
  { text: "Together, we are not just supporting a cause; we are shaping the future.", by: "Prachetas Foundation" },
  { text: "Every meal served is a reminder that compassion can nourish both people and the planet.", by: "Prachetas Foundation" },
  { text: "Serving meals, spreading hope, and building a sustainable future together.", by: "Prachetas Foundation" },
  { text: "Where compassion is shared, no one goes hungry.", by: "Prachetas Foundation" },
  { text: "A simple contribution can become a meal, a smile, and a new beginning.", by: "Prachetas Foundation" },
]

const MotivationStrip = () => {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div
      className="relative overflow-hidden py-5 px-4"
      style={{ background: 'linear-gradient(90deg, #c2410c 0%, #f97316 40%, #f59e0b 60%, #f97316 80%, #c2410c 100%)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-[shimmer_3s_ease-in-out_infinite]" />

      <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 relative z-10">
        <Quote size={18} className="text-white/40 flex-shrink-0" fill="currentColor" />
        <div className="flex-1 text-center min-h-[52px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-white font-semibold text-sm sm:text-base leading-snug">
                "{QUOTES[idx].text}"
              </p>
              <p className="text-white/60 text-xs mt-1.5 font-medium">— {QUOTES[idx].by}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <Quote size={18} className="text-white/40 flex-shrink-0 rotate-180" fill="currentColor" />
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {QUOTES.map((_, i) => (
          <button
            key={i} onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default MotivationStrip
