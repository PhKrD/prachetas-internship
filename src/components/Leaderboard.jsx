import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal } from 'lucide-react'
import { studentsData, batchMeta } from '../data/studentsData'

const TABS = [
  { key: 'donors', label: 'Top Donors', field: 'donorsCollected', suffix: '' },
  { key: 'sip',    label: 'Top SIP',    field: 'sipConversions',  suffix: '' },
  { key: 'amount', label: 'Top Amount', field: 'totalAmountCollected', isRupee: true },
]

const rankIcon = (rank) => {
  if (rank === 1) return <Trophy size={16} className="text-yellow-500" />
  if (rank === 2) return <Medal  size={16} className="text-gray-400"  />
  if (rank === 3) return <Medal  size={16} className="text-amber-600" />
  return <span className="text-xs font-bold text-gray-400 w-4 text-center">{rank}</span>
}

const fmt = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` :
  n >= 1000   ? `₹${(n / 1000).toFixed(0)}K`   : `₹${n}`

const Leaderboard = ({ onSelectStudent }) => {
  const [tab, setTab] = useState('donors')
  const current = TABS.find(t => t.key === tab)
  const top = [...studentsData].sort((a, b) => b[current.field] - a[current.field]).slice(0, 10)

  const getBatch = (id) => batchMeta.find(b => b.id === id)

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={22} className="text-yellow-500" /> Leaderboard
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Top 10 student performers</p>
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-white shadow text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dept.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Donors</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">SIP</th>
                <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Raised</th>
              </tr>
            </thead>
            <tbody>
              {top.map((s, i) => {
                const batch = getBatch(s.batch)
                const isHighlighted = tab === 'donors' && i < 3
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-green-50 ${
                      i === 0 ? 'bg-yellow-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-6">{rankIcon(i + 1)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${batch.gradFrom} ${batch.gradTo} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">
                            {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm leading-tight">{s.name}</div>
                          <div className="text-xs text-gray-400">{s.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${batch.badge}`}>{batch.name}</span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-gray-500 text-xs">{s.department}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${tab === 'donors' ? 'text-green-700 text-base' : 'text-gray-700'}`}>
                        {s.donorsCollected}
                      </span>
                      <span className="text-gray-400 text-xs">/100</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${tab === 'sip' ? 'text-blue-700 text-base' : 'text-gray-700'}`}>
                        {s.sipConversions}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-right">
                      <span className={`font-bold ${tab === 'amount' ? 'text-orange-600 text-base' : 'text-gray-700'}`}>
                        {fmt(s.totalAmountCollected)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Leaderboard
