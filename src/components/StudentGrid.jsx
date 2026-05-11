import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Users } from 'lucide-react'
import { studentsData, batchMeta } from '../data/studentsData'

const SORTS = [
  { key: 'donors', label: 'Donors ↓' },
  { key: 'sip',    label: 'SIP ↓'   },
  { key: 'amount', label: 'Amount ↓' },
  { key: 'name',   label: 'Name A–Z' },
]

const ProgressBar = ({ value, max, colorClass }) => {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

const StudentCard = ({ student, onSelect }) => {
  const batch = batchMeta.find(b => b.id === student.batch)
  const pct = Math.round((student.donorsCollected / student.donorTarget) * 100)
  const fmt = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4 }}
      onClick={() => onSelect(student)}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer group p-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${batch.gradFrom} ${batch.gradTo} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white text-sm font-bold">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-green-700 transition-colors">
            {student.name}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{student.rollNo}</div>
          <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full mt-1 ${batch.badge}`}>
            {batch.name}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-base font-bold text-gray-900">{student.donorsCollected}</div>
          <div className="text-xs text-gray-400">Donors</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-blue-700">{student.sipConversions}</div>
          <div className="text-xs text-gray-400">SIP</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-orange-600">{fmt(student.totalAmountCollected)}</div>
          <div className="text-xs text-gray-400">Raised</div>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Donor progress</span>
          <span className={`font-semibold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-orange-500' : 'text-gray-500'}`}>
            {pct}%
          </span>
        </div>
        <ProgressBar value={student.donorsCollected} max={student.donorTarget} colorClass={`bg-gradient-to-r ${batch.gradFrom} ${batch.gradTo}`} />
      </div>
    </motion.div>
  )
}

const StudentGrid = ({ activeBatch, onSelectStudent }) => {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('donors')

  const filtered = useMemo(() => {
    let list = activeBatch ? studentsData.filter(s => s.batch === activeBatch) : studentsData
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'donors') return b.donorsCollected - a.donorsCollected
      if (sortBy === 'sip')    return b.sipConversions  - a.sipConversions
      if (sortBy === 'amount') return b.totalAmountCollected - a.totalAmountCollected
      return a.name.localeCompare(b.name)
    })
  }, [activeBatch, search, sortBy])

  const activeMeta = activeBatch ? batchMeta.find(b => b.id === activeBatch) : null

  return (
    <section id="students" className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={22} className="text-green-700" />
              All Students
              {activeMeta && (
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${activeMeta.badge}`}>
                  {activeMeta.name}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} students shown</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search name, roll no…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 w-44"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-300 px-2 py-2">
              <SlidersHorizontal size={14} className="text-gray-400 flex-shrink-0" />
              <select
                value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-sm text-gray-700 outline-none bg-transparent"
              >
                {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Batch filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => activeBatch && onSelectStudent && false}
            className="text-xs text-gray-400 py-1 px-1"
          >
            {/* placeholder — batch filter is driven from BatchOverview */}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No students match your search.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(s => (
              <StudentCard key={s.id} student={s} onSelect={onSelectStudent} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default StudentGrid
