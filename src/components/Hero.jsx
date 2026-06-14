import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ExternalLink, Flame, Target, Users, Zap, RefreshCw, Download } from 'lucide-react'
import { useStudents, useStudentsLoading, useStudentsRefreshing, useRefreshData } from '../context/StudentsContext'
import { studentsData } from '../data/studentsData'

const SYNC_URL = 'https://prachetasfoundation.com/.netlify/functions/sync-payments'

const CountUp = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !target) return
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      setCount(Math.floor((1 - (1 - p) ** 3) * target))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setCount(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>
}

const Hero = () => {
  const students    = useStudents()
  const loading     = useStudentsLoading()
  const refreshing  = useStudentsRefreshing()
  const refreshData = useRefreshData()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const syncPayments = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await fetch(SYNC_URL, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncMsg(`✅ ${data.synced} new payments synced`)
        if (data.synced > 0) setTimeout(() => refreshData(), 1000)
      } else {
        setSyncMsg('❌ Sync failed')
      }
    } catch {
      setSyncMsg('❌ Network error')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 5000)
    }
  }
  const mainBatchStudents = students.filter(s => s.batch >= 1 && s.batch <= 5)
  const totalDonors = mainBatchStudents.reduce((s, x) => s + x.donorsCollected, 0)
  const totalSIP    = mainBatchStudents.reduce((s, x) => s + x.sipConversions, 0)
  const totalAmt    = mainBatchStudents.reduce((s, x) => s + x.totalAmountCollected, 0)
  const DONOR_TARGET = 18000
  const pct = Math.round((totalDonors / DONOR_TARGET) * 100)
  const C = 2 * Math.PI * 54
  const fmt = (n) => {
    const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
    const fractionDigits = Number.isInteger(v) ? 0 : 2
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
  }

  return (
    <section
      className="relative pt-16 overflow-hidden min-h-screen flex items-center"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(6,26,10,0.85) 0%, rgba(10,46,16,0.82) 35%, rgba(15,61,26,0.82) 65%, rgba(6,26,10,0.85) 100%), url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="1.5" fill="white" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={syncPayments}
              disabled={syncing}
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm text-emerald-200 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/30"
            >
              <Download size={16} className={syncing ? 'animate-pulse' : ''} />
              <span className="text-sm font-medium">{syncing ? 'Syncing...' : 'Sync Payments'}</span>
            </button>
            <button
              onClick={refreshData}
              disabled={loading || refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
          {syncMsg && (
            <span className="text-xs text-emerald-300 bg-black/40 px-3 py-1 rounded-full">{syncMsg}</span>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left copy ── */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full mb-7 tracking-widest uppercase"
            >
              <Flame size={12} className="text-orange-400" fill="currentColor" />
              Live Campaign · COEP × Prachetas 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-7"
            >
              Be The<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-green-400">Change.</span><br/>
              Fund The<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">Future.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="text-green-100/80 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Building a sustainable future while serving care, compassion, and meals to communities — together with Prachetas Foundation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <a
                href="https://prachetasfoundation.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold px-7 py-3.5 rounded-2xl text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                Donate Now <ExternalLink size={16} />
              </a>
              <a href="#students"
                className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white font-semibold px-7 py-3.5 rounded-2xl text-base transition-all"
              >
                <Zap size={16} className="text-green-300" /> View Students
              </a>
            </motion.div>

          </motion.div>

          {/* ── Right ring + stats ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Glowing ring */}
            <div className="relative">
              {/* glow halo */}
              <div className="absolute inset-0 rounded-full blur-3xl opacity-25 scale-110"
                style={{ background: `conic-gradient(from 270deg, #4ade80 ${pct}%, transparent ${pct}%)` }} />
              <svg className="w-64 h-64 -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="url(#ringGrad)" strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct / 100)}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(74,222,128,0.7))', transition: 'stroke-dashoffset 1.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-4xl font-black leading-none">
                  {fmt(totalAmt)}
                </div>
                <div className="text-sm text-emerald-300 font-bold mt-1">Total Raised</div>
              </div>
            </div>

            {/* Quick stat grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { icon: Users,  label: 'Donors Enrolled', value: totalDonors, color: 'text-green-300',  glow: 'shadow-green-500/20'  },
                { icon: Target, label: 'SIP Conversions', value: totalSIP,    color: 'text-blue-300',   glow: 'shadow-blue-500/20'   },
                  { icon: Zap,    label: 'Active Students', value: studentsData.length, color: 'text-emerald-300',glow: 'shadow-emerald-500/20'},
              ].map(({ icon: Icon, label, value, fmtVal, color, glow }) => (
                <div key={label} className={`bg-white/6 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm shadow-lg ${glow} hover:bg-white/10 transition-colors`}>
                  <Icon className={`${color} mx-auto mb-1.5`} size={18} />
                  <div className="text-xl font-black text-white leading-tight">
                    {fmtVal ?? <CountUp target={value} duration={1600} />}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Hero
