import { motion } from 'framer-motion'
import { studentsData, batchMeta } from '../data/studentsData'

const ProgressBar = ({ value, max, colorClass }) => {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{value.toLocaleString('en-IN')} / {max.toLocaleString('en-IN')}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const BatchOverview = ({ activeBatch, onSelectBatch }) => {
  const batchStats = batchMeta.map(b => {
    const students = studentsData.filter(s => s.batch === b.id)
    return {
      ...b,
      count:   students.length,
      donors:  students.reduce((s, x) => s + x.donorsCollected, 0),
      sip:     students.reduce((s, x) => s + x.sipConversions, 0),
      amount:  students.reduce((s, x) => s + x.totalAmountCollected, 0),
      donorTarget: students.length * 100,
    }
  })

  const fmt = (n) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`

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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${b.text}`}>{b.name}</div>
                    <div className="text-gray-500 text-xs">{b.count} students</div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.gradFrom} ${b.gradTo} flex items-center justify-center`}>
                    <span className="text-white font-black text-sm">B{b.id}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`${b.lightBg} rounded-xl p-2.5 text-center`}>
                    <div className={`text-xl font-bold ${b.text}`}>{b.donors.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-500">Donors</div>
                  </div>
                  <div className={`${b.lightBg} rounded-xl p-2.5 text-center`}>
                    <div className={`text-xl font-bold ${b.text}`}>{b.sip.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-500">SIP</div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-xs text-gray-400 mb-1 font-medium">Total Raised</div>
                <div className="text-base font-extrabold text-gray-800 mb-3">{fmt(b.amount)}</div>

                {/* Donor progress */}
                <div className="text-xs text-gray-400 mb-1">Donor target progress</div>
                <ProgressBar value={b.donors} max={b.donorTarget} colorClass={`${b.gradFrom} ${b.gradTo}`} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BatchOverview
