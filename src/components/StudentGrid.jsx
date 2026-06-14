import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Users } from 'lucide-react'
import { batchMeta, getBatchMeta } from '../data/studentsData'
import { useStudents } from '../context/StudentsContext'

const getAchievement = (pct) => {
  if (pct >= 90) return { emoji: '⭐', label: 'Star',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-300', ring: 'ring-2 ring-yellow-400/60' }
  if (pct >= 75) return { emoji: '🥇', label: 'Gold',   cls: 'bg-amber-50  text-amber-700  border-amber-300',  ring: 'ring-2 ring-amber-400/60'  }
  if (pct >= 50) return { emoji: '🥈', label: 'Silver', cls: 'bg-slate-50  text-slate-600  border-slate-300',  ring: 'ring-2 ring-slate-400/50'  }
  if (pct >= 25) return { emoji: '🥉', label: 'Bronze', cls: 'bg-orange-50 text-orange-700 border-orange-300', ring: 'ring-2 ring-orange-400/50' }
  return           { emoji: '🌱', label: 'Rookie', cls: 'bg-green-50  text-green-700  border-green-200',  ring: ''                          }
}

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
  const achievement = getAchievement(pct)
  const fmt = (n) => {
    const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`
    const fractionDigits = Number.isInteger(v) ? 0 : 2
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
  }
  const sipRate = student.donorsCollected > 0
    ? Math.round((student.sipConversions / student.donorsCollected) * 100) : 0
  const isSipChamp = sipRate >= 40
  const isAlmost   = pct >= 85 && pct < 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(student)}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer group p-4 relative ${achievement.ring} border-gray-200`}
    >
      {/* Achievement badge — top-right */}
      <div className={`absolute -top-2 -right-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm ${achievement.cls}`}>
        {achievement.emoji} {achievement.label}
      </div>

      {/* Almost there ribbon */}
      {isAlmost && (
        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
          🚀 Almost!
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 mt-1">
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
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${batch.badge}`}>{batch.name}</span>
            {isSipChamp && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">💎 SIP Champ</span>}
          </div>
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

      <div className={`text-xs font-medium ${batch.text} mt-1`}>
        {student.totalAmountCollected > 0
          ? `${fmt(student.totalAmountCollected)} raised`
          : 'No donations yet'}
      </div>
    </motion.div>
  )
}

const StudentGrid = ({ activeBatch, onSelectStudent, onSelectBatch }) => {
  const students = useStudents()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('donors')
  const displayBatchMeta = getBatchMeta(students)
  const activeBatchStudentCount = activeBatch ? students.filter(s => s.batch === activeBatch).length : students.length

  const filtered = useMemo(() => {
    let list = activeBatch ? students.filter(s => s.batch === activeBatch) : students
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'donors') return b.donorsCollected - a.donorsCollected
      if (sortBy === 'sip')    return b.sipConversions  - a.sipConversions
      if (sortBy === 'amount') return b.totalAmountCollected - a.totalAmountCollected
      return a.name.localeCompare(b.name)
    })
  }, [activeBatch, search, sortBy, students])

  const activeMeta = activeBatch ? displayBatchMeta.find(b => b.id === activeBatch) : null

  if (!activeBatch) {
    return (
      <section id="students" className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={22} className="text-green-700" /> Students
            </h2>
            <p className="text-gray-500 text-sm mt-1">Select a batch to explore its students</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayBatchMeta.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => onSelectBatch(b.id)}
                className={`bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.gradFrom} ${b.gradTo} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-black text-xl">B{b.id}</span>
                </div>
                <div className={`text-lg font-extrabold ${b.text} mb-1`}>{b.name}</div>
                <div className="text-gray-400 text-sm">
                  {students.filter(s => s.batch === b.id).length} students
                </div>
                <div className={`mt-4 text-xs font-semibold ${b.text} flex items-center gap-1`}>
                  View students →
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="students" className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={22} className="text-green-700" />
              {activeMeta?.name || 'All Students'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {activeMeta ? `${activeBatchStudentCount} students in ${activeMeta.name}` : 'All students across all batches'}
            </p>
          </div>
          {activeBatch && (
            <button
              onClick={() => onSelectBatch(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors"
            >
              ← Back to all batches
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-6">
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
