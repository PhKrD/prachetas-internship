import { motion } from 'framer-motion'
import { Users, Repeat, IndianRupee, CalendarCheck } from 'lucide-react'
import { studentsData } from '../data/studentsData'

const fmt = (n) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` :
  n >= 100000   ? `₹${(n / 100000).toFixed(2)} L`   :
  n >= 1000     ? `₹${(n / 1000).toFixed(1)}K`       : `₹${n}`

const CampaignStats = () => {
  const totalDonors  = studentsData.reduce((s, x) => s + x.donorsCollected, 0)
  const totalSIP     = studentsData.reduce((s, x) => s + x.sipConversions, 0)
  const totalAmt     = studentsData.reduce((s, x) => s + x.totalAmountCollected, 0)
  const totalMonthly = studentsData.reduce((s, x) => s + x.sipMonthlyAmount, 0)

  const DONOR_TARGET  = 18000
  const SIP_TARGET    = Math.round(DONOR_TARGET * 0.35)

  const cards = [
    {
      icon: Users,
      label: 'Total Donors Enrolled',
      value: totalDonors.toLocaleString('en-IN'),
      sub: `of ${DONOR_TARGET.toLocaleString('en-IN')} target`,
      pct: Math.min(100, Math.round((totalDonors / DONOR_TARGET) * 100)),
      barColor: 'bg-green-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
    },
    {
      icon: Repeat,
      label: 'SIP Conversions',
      value: totalSIP.toLocaleString('en-IN'),
      sub: `of ${SIP_TARGET.toLocaleString('en-IN')} target`,
      pct: Math.min(100, Math.round((totalSIP / SIP_TARGET) * 100)),
      barColor: 'bg-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
    },
    {
      icon: IndianRupee,
      label: 'Total Amount Raised',
      value: fmt(totalAmt),
      sub: 'one-time donations',
      pct: null,
      barColor: '',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-700',
    },
    {
      icon: CalendarCheck,
      label: 'Monthly SIP Committed',
      value: fmt(totalMonthly),
      sub: 'recurring / month',
      pct: null,
      barColor: '',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-700',
    },
  ]

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-900 mb-8 text-center"
        >
          Campaign Overview
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.iconBg}`}>
                <c.icon className={c.iconColor} size={20} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-0.5">{c.value}</div>
              <div className="text-sm font-medium text-gray-500 mb-3">{c.label}</div>
              {c.pct !== null ? (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{c.sub}</span>
                    <span className="font-semibold text-gray-700">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.barColor} transition-all duration-1000`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">{c.sub}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CampaignStats
