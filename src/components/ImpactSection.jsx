import { motion } from 'framer-motion'
import { TreePine, HeartHandshake, BookOpenCheck, RefreshCw } from 'lucide-react'
import { studentsData } from '../data/studentsData'

const ImpactSection = () => {
  const totalAmt    = studentsData.reduce((s, x) => s + x.totalAmountCollected, 0)
  const totalSIP    = studentsData.reduce((s, x) => s + x.sipConversions, 0)
  const totalDonors = studentsData.reduce((s, x) => s + x.donorsCollected, 0)

  const saplings        = Math.floor(totalAmt / 500)
  const familiesReached = Math.floor(totalDonors * 4)
  const sessions        = Math.floor(totalAmt / 1000)
  const monthsImpact    = totalSIP * 12

  const cards = [
    {
      icon: TreePine,
      value: saplings.toLocaleString('en-IN'),
      label: 'Saplings Can Be Planted',
      sub: 'Every ₹500 donated funds one sapling in degraded forests',
      from: 'from-emerald-500', to: 'to-green-600',
      glow: 'rgba(16,185,129,0.3)',
    },
    {
      icon: HeartHandshake,
      value: familiesReached.toLocaleString('en-IN'),
      label: 'People Reached',
      sub: 'Impact across families with a 4-member average per donor household',
      from: 'from-rose-500', to: 'to-pink-600',
      glow: 'rgba(244,63,94,0.3)',
    },
    {
      icon: BookOpenCheck,
      value: sessions.toLocaleString('en-IN'),
      label: 'Awareness Sessions',
      sub: 'Every ₹1,000 funds an environmental awareness session for communities',
      from: 'from-blue-500', to: 'to-indigo-600',
      glow: 'rgba(99,102,241,0.3)',
    },
    {
      icon: RefreshCw,
      value: monthsImpact.toLocaleString('en-IN'),
      label: 'Months of Sustained Impact',
      sub: 'From recurring SIP donations creating long-term environmental change',
      from: 'from-violet-500', to: 'to-purple-600',
      glow: 'rgba(139,92,246,0.3)',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #052010 0%, #0a3318 50%, #052010 100%)' }}
    >
      {/* top border accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-orange-500 to-green-400 opacity-70" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block text-orange-400 text-xs font-black uppercase tracking-[0.2em] bg-orange-400/10 border border-orange-400/20 px-4 py-1.5 rounded-full mb-4">
            🌍 Real-World Impact
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            Your Efforts Are<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
              Changing the World
            </span>
          </h2>
          <p className="text-green-200/70 text-base max-w-xl mx-auto leading-relaxed">
            Behind every ₹100 collected is a real, tangible change on the ground.
            Here's the collective impact your campaign is creating.
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
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.from} ${c.to} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500`} />

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
