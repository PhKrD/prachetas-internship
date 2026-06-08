import { motion } from 'framer-motion'
import { batchMeta } from '../data/studentsData'
import { useStudents } from '../context/StudentsContext'
import { Crown, Medal } from 'lucide-react'

const batchMetaOnly = batchMeta.filter(b => b.id <= 5)

const ProgressBar = ({ value, max, colorClass }) => {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{value.toLocaleString('en-IN')} / {max.toLocaleString('en-IN')}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const RankBadge = ({ rank }) => {
  if (rank === 1) return (
    <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">
      <Crown size={12} fill="currentColor" /> #1 Leading
    </div>
  )
  if (rank === 2) return (
    <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
      <Medal size={12} /> #2
    </div>
  )
  if (rank === 3) return (
    <div className="flex items-center gap-1 bg-orange-50 border border-orange-300 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
      <Medal size={12} /> #3
    </div>
  )
  return <div className="text-xs text-gray-400 font-medium px-2.5 py-1">#{rank}</div>
}

const BatchOverview = ({ activeBatch, onSelectBatch }) => {
  const students = useStudents()
  const batchStats = batchMetaOnly.map(b => {
    const bStudents = students.filter(s => s.batch === b.id)
    const top3 = [...bStudents].sort((a, b) => b.totalAmountCollected - a.totalAmountCollected).slice(0, 3)
    return {
      ...b,
      count:   bStudents.length,
      donors:  bStudents.reduce((s, x) => s + x.donorsCollected, 0),
      sip:     bStudents.reduce((s, x) => s + x.sipConversions, 0),
      amount:  bStudents.reduce((s, x) => s + x.totalAmountCollected, 0),
      donorTarget: bStudents.length * 100,
      top3,
    }
  }).sort((a, b) => b.amount - a.amount).map((b, i) => ({ ...b, rank: i + 1 }))

  const fmt = (n) => {
    const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
    const fractionDigits = Number.isInteger(v) ? 0 : 2
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
  }

  return (
    <section id="batches" className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Batch Performance</h2>
          <p className="text-gray-500 text-sm">Click a batch to filter students below</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {batchStats.map((b, i) => {
            const isActive = activeBatch === b.id
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => onSelectBatch(isActive ? null : b.id)}
                className={`bg-white rounded-2xl border-2 shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${
                  isActive ? `${b.border} shadow-md scale-[1.02]` : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${b.text}`}>{b.name}</div>
                    <div className="text-gray-500 text-xs">{b.count} students</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RankBadge rank={b.rank} />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.gradFrom} ${b.gradTo} flex items-center justify-center shadow-md`}>
                      <span className="text-white font-black text-sm">B{b.id}</span>
                    </div>
                  </div>
                </div>
                {/* Top 3 performers */}
                {b.top3.length > 0 && (
                  <div className={`${b.lightBg} border ${b.border} rounded-xl px-3 py-2 mb-3 space-y-1.5`}>
                    {b.top3.map((s, idx) => {
                      const medals = ['🥇','🥈','🥉']
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="text-sm leading-none">{medals[idx]}</span>
                          <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${b.gradFrom} ${b.gradTo} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-[10px] font-bold">{s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span>
                          </div>
                          <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
                            <span className={`text-xs font-semibold ${b.text} truncate`}>{s.name.split(' ')[0]}</span>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-xs font-bold text-gray-700">{fmt(s.totalAmountCollected)}</span>
                              <span className="text-[10px] text-blue-500">{s.sipConversions} SIP</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className={`${b.lightBg} rounded-xl p-2.5 text-center`}>
                    <div className={`text-xl font-bold ${b.text}`}>{fmt(b.amount)}</div>
                    <div className="text-xs text-gray-500">Funds Raised</div>
                  </div>
                  <div className={`${b.lightBg} rounded-xl p-2.5 text-center`}>
                    <div className={`text-xl font-bold ${b.text}`}>{b.sip.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-500">SIP</div>
                  </div>
                </div>

              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BatchOverview
