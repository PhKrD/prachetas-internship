import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, IndianRupee } from 'lucide-react'
import {
  useDirectDonors,
  useDirectDonorsLoading,
  useDirectDonorsError,
  useFetchDirectDonors,
} from '../context/StudentsContext'

const fmt = (n) => {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
  const fractionDigits = Number.isInteger(v) ? 0 : 2
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
}

const DirectDonations = () => {
  const donors = useDirectDonors()
  const loading = useDirectDonorsLoading()
  const error = useDirectDonorsError()
  const fetchDirectDonors = useFetchDirectDonors()

  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  const onUnlock = async (e) => {
    e.preventDefault()
    const ok = await fetchDirectDonors(password)
    if (ok) {
      setUnlocked(true)
      setPassword('')
    }
  }

  if (!unlocked) {
    return (
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Heart size={20} className="text-rose-500" /> All Donations (Protected)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter password to view all donations (personalized links + direct).
            </p>

            <form onSubmit={onUnlock} className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
              >
                {loading ? 'Checking...' : 'Unlock'}
              </button>
            </form>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </div>
        </div>
      </section>
    )
  }

  if (!donors || donors.length === 0) {
    return (
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Heart size={20} className="text-rose-500" /> All Donations
            </h2>
            <p className="text-sm text-gray-500">No donations found right now.</p>
          </div>
        </div>
      </section>
    )
  }

  const total = donors.reduce((s, d) => s + d.amount, 0)
  const directCount = donors.filter(d => !d.referredBy).length
  const referredCount = donors.filter(d => d.referredBy).length

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
              <Heart size={22} className="text-rose-500" /> All Donations
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {donors.length} total donation{donors.length !== 1 ? 's' : ''} · {referredCount} via links · {directCount} direct · Total {fmt(total)}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3">
            <IndianRupee size={18} className="text-rose-600" />
            <div>
              <div className="text-xl font-extrabold text-rose-700">{fmt(total)}</div>
              <div className="text-xs text-rose-500">Total raised</div>
            </div>
          </div>
        </motion.div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[4%]">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[20%]">Donor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[10%]">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[8%]">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[10%]">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[18%]">Referral Link</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[20%]">Message</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[10%]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.01 }}
                  className="border-b border-gray-100 hover:bg-rose-50/30 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${d.referredBy ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                        {d.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 truncate">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.date}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      d.type === 'SIP'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>{d.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    {d.referredBy ? (
                      <a
                        href={`https://prachetasfoundation.com/donate?ref=${d.referredBy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline truncate block"
                      >
                        {d.referredBy}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">Direct</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs italic truncate" title={d.message}>
                    {d.message || '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">{fmt(d.amount)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default DirectDonations
