import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Users, ChevronDown, ChevronUp, IndianRupee, Repeat, ArrowRight } from 'lucide-react'
import { groupsData } from '../data/groupsData'
import { batchMeta } from '../data/studentsData'
import { useStudents } from '../context/StudentsContext'

const TABS = [
  { key: 'amount', label: 'Top Amount', field: 'totalAmount', isRupee: true },
  { key: 'donors', label: 'Top Donors', field: 'totalDonors' },
  { key: 'sip',    label: 'Top SIP',    field: 'totalSip' },
]

const fmt = (n) => {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
  const fractionDigits = Number.isInteger(v) ? 0 : 2
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
}

const rankIcon = (rank) => {
  if (rank === 1) return <Trophy size={18} className="text-yellow-500 fill-yellow-50" />
  if (rank === 2) return <Medal  size={18} className="text-gray-400 fill-gray-50"  />
  if (rank === 3) return <Medal  size={18} className="text-amber-600 fill-amber-50" />
  return <span className="text-xs font-bold text-gray-400 w-5 text-center">{rank}</span>
}

const GroupLeaderboard = ({ onSelectStudent }) => {
  const students = useStudents()
  const [tab, setTab] = useState('amount')
  const [activeBatchFilter, setActiveBatchFilter] = useState('all') // 'all', 1, 2, 3
  const [expandedGroup, setExpandedGroup] = useState(null)

  // Calculate stats for all groups dynamically
  const calculatedGroups = groupsData.map((group, idx) => {
    const groupMembers = group.members.map(slug => {
      const student = students.find(s => s.slug === slug)
      return student || {
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        rollNo: 'N/A',
        totalAmountCollected: 0,
        donorsCollected: 0,
        sipConversions: 0,
        slug: slug,
        notFound: true
      }
    })

    const totalAmount = groupMembers.reduce((sum, m) => sum + (m.totalAmountCollected || 0), 0)
    const totalDonors = groupMembers.reduce((sum, m) => sum + (m.donorsCollected || 0), 0)
    const totalSip = groupMembers.reduce((sum, m) => sum + (m.sipConversions || 0), 0)

    return {
      ...group,
      id: idx + 1,
      membersData: groupMembers,
      totalAmount,
      totalDonors,
      totalSip
    }
  })

  // Filter groups by batch if specified
  const filteredGroups = calculatedGroups.filter(g => 
    activeBatchFilter === 'all' || g.batch === Number(activeBatchFilter)
  )

  // Sort groups based on active tab
  const currentTabInfo = TABS.find(t => t.key === tab)
  const sortedGroups = [...filteredGroups]
    .sort((a, b) => {
      const diff = b[currentTabInfo.field] - a[currentTabInfo.field]
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name)
    })
    .map((g, index) => ({ ...g, rank: index + 1 }))

  const getBatch = (id) => batchMeta.find(b => b.id === id)

  // Overall leading group stats
  const leadingGroup = [...calculatedGroups].sort((a, b) => b.totalAmount - a.totalAmount)[0]

  return (
    <section id="groups" className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">New Feature</span>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={24} className="text-green-600" /> Group Leaderboard
              </h2>
            </div>
            <p className="text-sm text-gray-500">Track and support student fundraising circles</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Batch Filter Buttons */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveBatchFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeBatchFilter === 'all' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Batches
              </button>
              {[1, 2, 3].map(bNo => (
                <button
                  key={bNo}
                  onClick={() => setActiveBatchFilter(bNo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeBatchFilter === bNo ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Batch {bNo}
                </button>
              ))}
            </div>

            {/* Metric Tab Buttons */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === t.key ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Group Highlights Cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wider">Leading Group</div>
              <div className="text-lg font-black text-gray-900 truncate max-w-[180px]">{leadingGroup?.name}</div>
              <div className="text-xs text-gray-500 font-bold">{fmt(leadingGroup?.totalAmount || 0)} raised</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Active Circles</div>
              <div className="text-xl font-black text-gray-900">{groupsData.length} Groups</div>
              <div className="text-xs text-gray-500 font-bold">Collaborative Fundraising</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow">
              <Repeat size={20} />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Group Target</div>
              <div className="text-xl font-black text-gray-900">₹2.0L Average</div>
              <div className="text-xs text-gray-500 font-bold">Supporting grassroots scholars</div>
            </div>
          </div>
        </div>

        {/* Group list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {sortedGroups.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold">No groups found for Batch {activeBatchFilter}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedGroups.map((group, index) => {
                const isExpanded = expandedGroup === group.id
                const batch = getBatch(group.batch)
                
                return (
                  <div key={group.id} className={`transition-all ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>
                    
                    {/* Summary row */}
                    <div 
                      onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 flex items-center justify-center">
                          {rankIcon(group.rank)}
                        </div>

                        {/* Group Name & Batch */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base leading-snug">{group.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${batch.badge}`}>
                              Batch {group.batch}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {group.membersData.length} members · {group.membersData.filter(m => !m.notFound).length} mapped
                          </p>
                        </div>
                      </div>

                      {/* Stats Column */}
                      <div className="flex items-center gap-6 sm:gap-10 justify-between sm:justify-end">
                        <div className="text-center sm:text-right min-w-[70px]">
                          <div className={`text-xs text-gray-400 font-medium ${tab === 'donors' ? 'font-bold' : ''}`}>Donors</div>
                          <div className={`font-black text-sm ${tab === 'donors' ? 'text-green-700 text-base' : 'text-gray-700'}`}>
                            {group.totalDonors}
                          </div>
                        </div>

                        <div className="text-center sm:text-right min-w-[50px]">
                          <div className={`text-xs text-gray-400 font-medium ${tab === 'sip' ? 'font-bold' : ''}`}>SIP</div>
                          <div className={`font-black text-sm ${tab === 'sip' ? 'text-blue-700 text-base' : 'text-gray-700'}`}>
                            {group.totalSip}
                          </div>
                        </div>

                        <div className="text-center sm:text-right min-w-[100px]">
                          <div className={`text-xs text-gray-400 font-medium ${tab === 'amount' ? 'font-bold' : ''}`}>Funds Raised</div>
                          <div className={`font-black text-base ${tab === 'amount' ? 'text-orange-600 text-lg' : 'text-gray-900'}`}>
                            {fmt(group.totalAmount)}
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Members list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-gray-100 bg-gray-50/30"
                        >
                          <div className="px-5 py-4 pl-12">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Group Members Contribution</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {group.membersData.map((member, mIdx) => {
                                const isReal = !member.notFound
                                return (
                                  <div 
                                    key={member.slug || mIdx}
                                    onClick={() => isReal && onSelectStudent(member)}
                                    className={`p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full transition-all ${
                                      isReal ? 'cursor-pointer hover:border-green-300 hover:shadow-md' : 'opacity-60'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-bold text-gray-800 text-xs truncate max-w-[120px] block" title={member.name}>
                                          {member.name}
                                        </span>
                                        {isReal ? (
                                          <span className="text-[9px] font-semibold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                                            {member.rollNo.split('-').pop()}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-semibold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                                            Roster
                                          </span>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
                                        <div>
                                          <div className="text-[10px] text-gray-400">Raised</div>
                                          <div className="text-xs font-bold text-gray-700">{fmt(member.totalAmountCollected || 0)}</div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] text-gray-400">Donors / SIP</div>
                                          <div className="text-xs font-bold text-gray-700">
                                            {member.donorsCollected || 0} / <span className="text-blue-500">{member.sipConversions || 0}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {isReal && (
                                      <div className="flex justify-end mt-2 pt-1">
                                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 group-hover:underline">
                                          View Profile <ArrowRight size={10} />
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

export default GroupLeaderboard
