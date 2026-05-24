import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Repeat, IndianRupee, CalendarCheck, BadgeCheck, ExternalLink, Copy, Check, Eye, EyeOff, Link, Receipt } from 'lucide-react'
import { batchMeta } from '../data/studentsData'
import { useStudents } from '../context/StudentsContext'

const BASE_DONATE_URL = 'https://prachetasfoundation.com/donate'

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

const fmt = (n) => {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
  const fractionDigits = Number.isInteger(v) ? 0 : 2
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
}

const StudentProfile = ({ student, onBack }) => {
  const allStudents = useStudents()

  // Always use the live version from context so donors update once fetched
  const s = allStudents.find(x => x.id === student.id) ?? student

  const batch = batchMeta.find(b => b.id === s.batch)
  const sipRate = s.donorsCollected > 0
    ? Math.round((s.sipConversions / s.donorsCollected) * 100)
    : 0

  const rank = [...allStudents]
    .sort((a, b) => b.donorsCollected - a.donorsCollected)
    .findIndex(x => x.id === s.id) + 1

  const slug = student.slug
  const personalLink = `${BASE_DONATE_URL}?ref=${slug}`

  const storageKey = `fl_show_${slug}`
  const [showOnDashboard, setShowOnDashboard] = useState(
    () => localStorage.getItem(storageKey) !== 'false'
  )
  const [copied, setCopied] = useState(false)

  const toggleShowOnDashboard = (val) => {
    setShowOnDashboard(val)
    localStorage.setItem(storageKey, String(val))
    fetch(
      `/.netlify/functions/fundraiser-link?slug=${slug}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ showOnDashboard: val }) }
    ).catch(() => {})
  }

  const copyLink = () => {
    navigator.clipboard.writeText(personalLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white mb-1">{s.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">{s.rollNo}</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full font-medium">{batch.name}</span>
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
          <StatCard icon={Users}        label="Donors Enrolled"     value={s.donorsCollected}          sub="donors supporting" iconBg="bg-green-100"  iconColor="text-green-700" />
          <StatCard icon={Repeat}       label="SIP Conversions"     value={s.sipConversions}           sub={`${sipRate}% rate`}                iconBg="bg-blue-100"   iconColor="text-blue-700"  />
          <StatCard icon={IndianRupee}  label="Total Raised"        value={fmt(s.totalAmountCollected)} sub="one-time donations"               iconBg="bg-orange-100" iconColor="text-orange-700"/>
          <StatCard icon={CalendarCheck}label="Monthly SIP"         value={fmt(s.sipMonthlyAmount)}    sub="recurring / month"                iconBg="bg-violet-100" iconColor="text-violet-700"/>
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
            label={`SIP Conversion Rate (${s.sipConversions} of ${s.donorsCollected} donors)`}
            pct={sipRate} value={s.sipConversions} max={s.donorsCollected}
            barColor="bg-gradient-to-r from-blue-400 to-blue-600"
          />
        </motion.div>

        {/* My Fundraiser Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6"
        >
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Link size={18} className="text-orange-500" /> My Fundraiser Link
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Share this personal link. Every donation made through it will be tracked under your name.
          </p>

          {/* Link display + copy */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
            <span className="flex-1 text-sm text-gray-700 truncate font-mono">{personalLink}</span>
            <button
              onClick={copyLink}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                copied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>

          {/* Direct donate button */}
          <a
            href={personalLink}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:shadow-md transition-all mb-4"
          >
            Open Donation Page <ExternalLink size={13} />
          </a>

          {/* Show on dashboard toggle */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <div>
              <div className="text-sm font-semibold text-gray-800">Show on Public Dashboard</div>
              <div className="text-xs text-gray-400">Allow your fundraiser stats to appear publicly</div>
            </div>
            <button
              onClick={() => toggleShowOnDashboard(!showOnDashboard)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                showOnDashboard ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                showOnDashboard ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {showOnDashboard ? (
            <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1"><Eye size={12} /> Visible on dashboard</p>
          ) : (
            <p className="text-xs text-gray-400 font-medium mt-2 flex items-center gap-1"><EyeOff size={12} /> Hidden from dashboard</p>
          )}
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6"
        >
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-orange-500" /> Payment History
          </h2>

          {s.donors && s.donors.length > 0 ? (
            <div className="space-y-3">
              {s.donors.map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {donor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{donor.name}</div>
                      <div className="text-xs text-gray-500">{donor.date} · {donor.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{fmt(donor.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Receipt size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payments recorded yet</p>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6 text-center shadow-lg"
        >
          <div className="text-white font-bold text-lg mb-1">
            Support {s.name.split(' ')[0]}'s Campaign
          </div>
          <p className="text-green-200 text-sm mb-4">
            Make a one-time donation or start a SIP to support Prachetas Foundation's mission.
          </p>
          <a
            href={personalLink}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow hover:shadow-lg transition-all"
          >
            Donate via {s.name.split(' ')[0]}'s Link <ExternalLink size={14} />
          </a>
        </motion.div>

      </div>
    </div>
  )
}

export default StudentProfile
