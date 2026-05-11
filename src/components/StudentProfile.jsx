import { motion } from 'framer-motion'
import { ArrowLeft, Users, Repeat, IndianRupee, CalendarCheck, GraduationCap, BadgeCheck, ExternalLink } from 'lucide-react'
import { batchMeta, studentsData } from '../data/studentsData'

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
      <Icon className={iconColor} size={18} />
    </div>
    <div className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</div>
    <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>
)

const Bar = ({ label, value, max, pct: forcePct, barColor, badge }) => {
  const pct = forcePct ?? Math.min(100, Math.round((value / max) * 100))
  const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-orange-500' : 'text-gray-500'
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`font-bold ${color}`}>{pct}%  {badge && <span className="text-xs text-gray-400">({value}{max ? `/${max}` : ''})</span>}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const fmt = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` :
  n >= 1000   ? `₹${(n / 1000).toFixed(1)}K`   : `₹${n}`

const StudentProfile = ({ student, onBack }) => {
  const batch = batchMeta.find(b => b.id === student.batch)
  const sipRate = student.donorsCollected > 0
    ? Math.round((student.sipConversions / student.donorsCollected) * 100)
    : 0

  const rank = [...studentsData]
    .sort((a, b) => b.donorsCollected - a.donorsCollected)
    .findIndex(s => s.id === student.id) + 1

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to all students
        </motion.button>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-gradient-to-br ${batch.gradFrom} ${batch.gradTo} rounded-3xl p-7 mb-6 shadow-lg`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-black">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white mb-1">{student.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">{student.rollNo}</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">{batch.name}</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <GraduationCap size={13} /> {student.department}
                </span>
              </div>
            </div>

            {/* Rank badge */}
            <div className="flex flex-col items-center bg-white/20 border border-white/40 rounded-2xl px-4 py-3 flex-shrink-0">
              <div className="text-3xl font-black text-white">#{rank}</div>
              <div className="text-xs text-white/80 font-medium">Overall Rank</div>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <StatCard icon={Users}        label="Donors Enrolled"     value={student.donorsCollected}          sub={`target: ${student.donorTarget}`} iconBg="bg-green-100"  iconColor="text-green-700" />
          <StatCard icon={Repeat}       label="SIP Conversions"     value={student.sipConversions}           sub={`${sipRate}% rate`}                iconBg="bg-blue-100"   iconColor="text-blue-700"  />
          <StatCard icon={IndianRupee}  label="Total Raised"        value={fmt(student.totalAmountCollected)} sub="one-time donations"               iconBg="bg-orange-100" iconColor="text-orange-700"/>
          <StatCard icon={CalendarCheck}label="Monthly SIP"         value={fmt(student.sipMonthlyAmount)}    sub="recurring / month"                iconBg="bg-violet-100" iconColor="text-violet-700"/>
        </motion.div>

        {/* Progress section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6"
        >
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <BadgeCheck size={18} className="text-green-600" /> Progress Tracker
          </h2>

          <Bar
            label="Donor Target (100 people)" value={student.donorsCollected} max={student.donorTarget}
            barColor={`bg-gradient-to-r ${batch.gradFrom} ${batch.gradTo}`} badge
          />
          <Bar
            label={`SIP Conversion Rate (${student.sipConversions} of ${student.donorsCollected} donors)`}
            pct={sipRate} value={student.sipConversions} max={student.donorsCollected}
            barColor="bg-gradient-to-r from-blue-400 to-blue-600"
          />
          <Bar
            label="Monthly SIP Amount vs ₹5,000 goal" value={student.sipMonthlyAmount} max={5000}
            barColor="bg-gradient-to-r from-violet-400 to-violet-600" badge
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6 text-center shadow-lg"
        >
          <div className="text-white font-bold text-lg mb-1">
            Support {student.name.split(' ')[0]}'s Campaign
          </div>
          <p className="text-green-200 text-sm mb-4">
            Make a one-time donation or start a SIP to support Prachetas Foundation's environmental mission.
          </p>
          <a
            href="https://prachetasfoundation.com"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow hover:shadow-lg transition-all"
          >
            Donate on Prachetas Foundation <ExternalLink size={14} />
          </a>
        </motion.div>

      </div>
    </div>
  )
}

export default StudentProfile
