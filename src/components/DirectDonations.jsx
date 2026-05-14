import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, IndianRupee } from 'lucide-react'
import {
  useDirectDonors,
  useDirectDonorsLoading,
  useDirectDonorsError,
  useFetchDirectDonors,
} from '../context/StudentsContext'

const fmt = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` :
  n >= 1000   ? `₹${(n / 1000).toFixed(1)}K`   : `₹${n}`

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
              <Heart size={20} className="text-rose-500" /> Direct Donations (Protected)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter password to view direct-donation donor list.
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
              <Heart size={20} className="text-rose-500" /> Direct Donations
            </h2>
            <p className="text-sm text-gray-500">No direct donations found right now.</p>
          </div>
        </div>
      </section>
    )
  }

  const total = donors.reduce((s, d) => s + d.amount, 0)

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
              <Heart size={22} className="text-rose-500" /> Direct Donations
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {donors.length} donor{donors.length !== 1 ? 's' : ''} donated directly · Total {fmt(total)}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3">
            <IndianRupee size={18} className="text-rose-600" />
            <div>
              <div className="text-xl font-extrabold text-rose-700">{fmt(total)}</div>
              <div className="text-xs text-rose-500">Raised directly</div>
            </div>
          </div>
        </motion.div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[42%]">Donor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[20%]">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[18%]">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[20%]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="border-b border-gray-100 hover:bg-rose-50/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs flex-shrink-0">
                        {d.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 truncate">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      d.type === 'SIP'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>{d.type}</span>
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
