import { motion } from 'framer-motion'
import { Users, Repeat, IndianRupee, CalendarCheck } from 'lucide-react'
import { useStudents } from '../context/StudentsContext'

const fmt = (n) => {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100
  const fractionDigits = Number.isInteger(v) ? 0 : 2
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
}

const CampaignStats = () => {
  const students     = useStudents()
  const mainBatchStudents = students.filter(s => s.batch >= 1 && s.batch <= 5)
  const totalDonors  = students.reduce((s, x) => s + x.donorsCollected, 0)
  const totalSIP     = students.reduce((s, x) => s + x.sipConversions, 0)
  const totalAmt     = mainBatchStudents.reduce((s, x) => s + x.totalAmountCollected, 0)
  const totalMonthly = students.reduce((s, x) => s + x.sipMonthlyAmount, 0)

  const cards = [
    {
      icon: IndianRupee,
      label: 'Total Amount Raised',
      value: fmt(totalAmt),
      sub: 'one-time donations collected',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-700',
    },
    {
      icon: CalendarCheck,
      label: 'Monthly SIP Committed',
      value: fmt(totalMonthly),
      sub: 'recurring monthly support',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-700',
    },
    {
      icon: Users,
      label: 'Total Donors Enrolled',
      value: totalDonors.toLocaleString('en-IN'),
      sub: 'donors supporting Prachetas',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
    },
    {
      icon: Repeat,
      label: 'SIP Conversions',
      value: totalSIP.toLocaleString('en-IN'),
      sub: 'committed to monthly giving',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
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
              <div className="text-xs text-gray-400">{c.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CampaignStats
