import { motion } from 'framer-motion'
import { ExternalLink, Users, Target, TrendingUp } from 'lucide-react'
import { studentsData } from '../data/studentsData'

const Hero = () => {
  const totalDonors = studentsData.reduce((s, x) => s + x.donorsCollected, 0)
  const totalSIP    = studentsData.reduce((s, x) => s + x.sipConversions, 0)
  const totalAmt    = studentsData.reduce((s, x) => s + x.totalAmountCollected, 0)
  const DONOR_TARGET = 18000

  const pct = Math.round((totalDonors / DONOR_TARGET) * 100)

  const fmt = (n) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` :
    n >= 1000   ? `₹${(n / 1000).toFixed(1)}K`   : `₹${n}`

  return (
    <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 min-h-[520px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              Live Campaign Tracker
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4 text-balance">
              COEP × Prachetas<br/>
              <span className="text-orange-400">Social Internship</span>
            </h1>
            <p className="text-green-100 text-lg mb-6 leading-relaxed max-w-lg">
              180 engineering students from COEP Pune are on a mission — reaching 18,000 people to support Prachetas Foundation's work in environmental conservation.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-white text-sm font-medium border border-white/20">
                <Users size={16} className="text-orange-300" />
                180 Student Interns
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-white text-sm font-medium border border-white/20">
                <Target size={16} className="text-orange-300" />
                18,000 Donor Target
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-white text-sm font-medium border border-white/20">
                <TrendingUp size={16} className="text-orange-300" />
                4 Batches
              </div>
            </div>

            <a
              href="https://prachetasfoundation.com"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-base shadow-lg hover:shadow-xl transition-all"
            >
              Support This Campaign
              <ExternalLink size={16} />
            </a>
          </motion.div>

          {/* Right — progress circle + stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Circular progress */}
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#f97316" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-4xl font-black">{pct}%</span>
                <span className="text-xs text-green-200 font-medium mt-0.5">of donor target</span>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {[
                { label: 'Donors', value: totalDonors.toLocaleString('en-IN') },
                { label: 'SIP Conversions', value: totalSIP.toLocaleString('en-IN') },
                { label: 'Total Raised', value: fmt(totalAmt) },
              ].map(s => (
                <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-green-200 mt-0.5 leading-tight">{s.label}</div>
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
