import { motion } from 'framer-motion'
import { Utensils, GraduationCap, HeartPulse, Leaf } from 'lucide-react'

const ImpactSection = () => {
  const cards = [
    {
      icon: Utensils,
      value: '50,000+',
      label: 'Meals Served',
      sub: 'Nutritious meals distributed to families in need across communities we serve',
      tag: '🍱 Primary Focus',
      tagCls: 'bg-orange-100 text-orange-700 border-orange-200',
      from: 'from-orange-500', to: 'to-amber-600',
      glow: 'rgba(249,115,22,0.25)',
    },
    {
      icon: GraduationCap,
      value: '20+',
      label: 'Students Supported',
      sub: 'Children receiving scholarships and educational support through our programmes',
      tag: '📚 Education',
      tagCls: 'bg-blue-100 text-blue-700 border-blue-200',
      from: 'from-blue-500', to: 'to-indigo-600',
      glow: 'rgba(99,102,241,0.25)',
    },
    {
      icon: HeartPulse,
      value: '200+',
      label: 'Wellness Camps',
      sub: 'Health & wellness camps bringing medical care and well-being to underserved communities',
      tag: '💚 Wellness',
      tagCls: 'bg-rose-100 text-rose-700 border-rose-200',
      from: 'from-rose-500', to: 'to-pink-600',
      glow: 'rgba(244,63,94,0.25)',
    },
    {
      icon: Leaf,
      value: '48+',
      label: 'Months of Eco-Support',
      sub: '4 years of sustained environmental action — conservation, awareness & green initiatives',
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

      </div>
    </section>
  )
}

export default ImpactSection
