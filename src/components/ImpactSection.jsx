import { motion } from 'framer-motion'
import { Utensils, GraduationCap, HeartPulse, Leaf } from 'lucide-react'
import { studentsData } from '../data/studentsData'

const ImpactSection = () => {
  const totalAmt = studentsData.reduce((s, x) => s + x.totalAmountCollected, 0)
  const totalSIP = studentsData.reduce((s, x) => s + x.sipConversions, 0)

  /* Impact estimates per Prachetas Foundation focus areas */
  const mealsServed      = Math.floor(totalAmt / 50)          // ₹50 per meal
  const studentsSupported = Math.floor(totalAmt / 500)        // ₹500/month per student
  const wellnessCamps    = Math.floor(totalAmt / 2000)        // ₹2,000 per wellness camp
  const ecoMonths        = totalSIP * 12                      // months of sustained eco-support

  const cards = [
    {
      icon: Utensils,
      value: mealsServed.toLocaleString('en-IN'),
      label: 'Meals Served',
      sub: 'Food distribution is our primary mission — every ₹50 feeds one person a nutritious meal',
      tag: '🍱 Primary Focus',
      tagCls: 'bg-orange-100 text-orange-700 border-orange-200',
      from: 'from-orange-500', to: 'to-amber-600',
      glow: 'rgba(249,115,22,0.25)',
    },
    {
      icon: GraduationCap,
      value: studentsSupported.toLocaleString('en-IN'),
      label: 'Students Supported',
      sub: 'Funding education initiatives so every child gets access to quality learning',
      tag: '📚 Education',
      tagCls: 'bg-blue-100 text-blue-700 border-blue-200',
      from: 'from-blue-500', to: 'to-indigo-600',
      glow: 'rgba(99,102,241,0.25)',
    },
    {
      icon: HeartPulse,
      value: wellnessCamps.toLocaleString('en-IN'),
      label: 'Wellness Camps',
      sub: 'Health & wellness camps bringing medical care and mental well-being to communities',
      tag: '💚 Wellness',
      tagCls: 'bg-rose-100 text-rose-700 border-rose-200',
      from: 'from-rose-500', to: 'to-pink-600',
      glow: 'rgba(244,63,94,0.25)',
    },
    {
      icon: Leaf,
      value: ecoMonths.toLocaleString('en-IN'),
      label: 'Months of Eco-Support',
      sub: 'Recurring SIP donations sustain long-term sustainability & conservation projects',
      tag: '🌱 Sustainability',
      tagCls: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      from: 'from-emerald-500', to: 'to-green-600',
      glow: 'rgba(16,185,129,0.25)',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #052010 0%, #0a3318 50%, #052010 100%)' }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-green-400 opacity-70" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block text-orange-400 text-xs font-black uppercase tracking-[0.2em] bg-orange-400/10 border border-orange-400/20 px-4 py-1.5 rounded-full mb-4">
            🤝 Our Mission in Action
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            4 Pillars of Change.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-400">
              One Unified Mission.
            </span>
          </h2>
          <p className="text-green-200/70 text-base max-w-xl mx-auto leading-relaxed">
            Every rupee you raise powers Prachetas Foundation's four core programs —
            feeding families, educating children, improving wellness, and sustaining our planet.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden group cursor-default"
              style={{ boxShadow: `0 20px 60px ${c.glow}` }}
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.from} ${c.to} opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-500`} />

              {/* Focus area tag */}
              <div className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mb-3 ${c.tagCls}`}>
                {c.tag}
              </div>

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <c.icon className="text-white" size={24} />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1 tabular-nums">{c.value}</div>
              <div className="text-sm font-bold text-gray-800 mb-2 leading-snug">{c.label}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{c.sub}</div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.6 }}
          className="text-center text-green-600/50 text-xs mt-8"
        >
          * Figures are illustrative estimates based on Prachetas Foundation's average program costs
        </motion.p>
      </div>
    </section>
  )
}

export default ImpactSection
