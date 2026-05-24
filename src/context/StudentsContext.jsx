import { createContext, useContext, useState, useEffect } from 'react'
import { studentsData } from '../data/studentsData'

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'
const OTHERS_URL = 'https://prachetasfoundation.com/.netlify/functions/fundraiser-link?all=true'
const DIRECT_DONATIONS_URL = 'https://prachetasfoundation.com/.netlify/functions/direct-donations'

const NEON_CONN = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'
const NEON_API  = 'https://api.c-3.us-east-1.aws.neon.tech/sql'

// Mapping for fundraiser link slugs that don't match student slugs
const SLUG_MAPPING = {
  'amruta-shriramjwar-m9ah': 'amruta-shriramjwar',
  'amruta-shriramjwar': 'amruta-shriramjwar',
  'aryan-khairkhar-b1': 'aryan-khairkhar',
  'mukul-manohar-bhosale]': 'mukul-manohar-bhosale',
  'aman-khandelwal-k3mz': 'aman-khandelwal-k3mz',
  // Add more mappings as needed
}

const normalizeSlug = (slug) => SLUG_MAPPING[slug] || slug

// Some Razorpay records are missing referred_by; force-map known payment IDs
const PAYMENT_SLUG_OVERRIDES = {
  pay_SsEQWRGPIRHLq8: 'aadya-shah',
  pay_SsHg1oiatK8TmM: 'aadya-shah',
  pay_SsHgloiatK8TmM: 'aadya-shah',
  pay_SrF4gAvJhBEHiC: 'aadya-shah',
  pay_SshXSSuHm9lyGu: 'chinmay-vikas-chavan',
  pay_St7UrIAgPTLJn0: 'parth-patil',
  pay_St7UrIAgPTLJnO: 'parth-patil',
  pay_Ssr6HIpnunImUE: 'aryan-khairkhar',
  pay_Srk4B6w59dVI8d: 'mukul-manohar-bhosale',
  pay_SsLxhIkLusDKsu: 'mukul-manohar-bhosale',
}

// Fallback attribution when provider-side referred_by is missing
const MANUAL_DONOR_OVERRIDES = {
  'aadya-shah': [
    {
      paymentId: 'pay_SsEQWRGPIRHLq8',
      name: 'Abburi Visweswara Rao',
      amount: 1000,
      date: '2026-05-22',
      type: 'One-time',
    },
    {
      paymentId: 'pay_SsHg1oiatK8TmM',
      name: 'Rohini',
      amount: 500,
      date: '2026-05-22',
      type: 'One-time',
    },
    {
      paymentId: 'pay_SrF4gAvJhBEHiC',
      name: 'Shivli Soni',
      amount: 100,
      date: '2026-05-19',
      type: 'One-time',
    },
  ],
  'chinmay-vikas-chavan': [
    {
      paymentId: 'pay_SshXSSuHm9lyGu',
      name: 'Apurva chavan',
      amount: 100,
      date: '2026-05-23',
      type: 'One-time',
    },
  ],
  'parth-patil': [
    {
      paymentId: 'pay_St7UrIAgPTLJn0',
      name: 'Shatakshee Patil',
      amount: 500,
      date: '2026-05-24',
      type: 'One-time',
    },
    {
      paymentId: 'utr_485020494237',
      name: 'PhonePe Donor',
      amount: 500,
      date: '2026-05-20',
      type: 'One-time',
    },
  ],
  'shambhavi-sachin-jagtap': [
    {
      paymentId: 'manual_shambhavi_anon_500_2026_05_24',
      name: 'Anonymous',
      amount: 500,
      date: '2026-05-24',
      type: 'One-time',
    },
  ],
  'kalyani-gajanan-jaybhaye': [
    {
      paymentId: 'upi_002404886084',
      name: 'Rupali Balaji Lokhande',
      amount: 100,
      date: '2026-05-22',
      type: 'One-time',
    },
    {
      paymentId: 'utr_982212016672',
      name: 'PhonePe Donor',
      amount: 200,
      date: '2026-05-22',
      type: 'One-time',
    },
    {
      paymentId: 'paytm_ref_306648792547',
      name: 'satish doiphode',
      amount: 500,
      date: '2026-05-23',
      type: 'One-time',
    },
  ],
  'aryan-khairkhar': [
    {
      paymentId: 'pay_Ssr6HIpnunImUE',
      name: 'Aryan Khairkhar',
      amount: 26.26,
      date: '2026-05-23',
      type: 'One-time',
    },
  ],
  'mukul-manohar-bhosale': [
    {
      paymentId: 'pay_Srk4B6w59dVI8d',
      name: 'Mukul Manohar Bhosale',
      amount: 101,
      date: '2026-05-20',
      type: 'One-time',
    },
    {
      paymentId: 'pay_SsLxhIkLusDKsu',
      name: 'Aarnav Potharkar',
      amount: 100,
      date: '2026-05-22',
      type: 'One-time',
    },
  ],
  'nayan-daulat-suryawanshi': [
    {
      paymentId: 'upi_614120990477',
      name: 'Snehal Ravindra More',
      amount: 200,
      date: '2026-05-21',
      type: 'One-time',
    },
  ],
}

const applyManualDonorOverrides = (baseDonors) => {
  const merged = { ...baseDonors }

  for (const [slug, manualDonors] of Object.entries(MANUAL_DONOR_OVERRIDES)) {
    const existing = [...(merged[slug] || [])]
    const existingIds = new Set(existing.map(d => d.paymentId).filter(Boolean))
    const existingSig = new Set(existing.map(d => `${d.name}|${d.amount}|${d.date}|${d.type}`))

    for (const donor of manualDonors) {
      const sig = `${donor.name}|${donor.amount}|${donor.date}|${donor.type}`
      if ((donor.paymentId && existingIds.has(donor.paymentId)) || existingSig.has(sig)) continue
      existing.push(donor)
      if (donor.paymentId) existingIds.add(donor.paymentId)
      existingSig.add(sig)
    }

    merged[slug] = existing
  }

  return merged
}

const neonQuery = async (query) => {
  const res = await fetch(NEON_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_CONN,
    },
    body: JSON.stringify({ query, params: [] }),
  })
  const data = await res.json()
  if (data.message) throw new Error(data.message)
  return data.rows ?? []
}

const StudentsContext = createContext(null)

export const StudentsProvider = ({ children }) => {
  const [statsMap, setStatsMap]       = useState({})
  const [donorsMap, setDonorsMap]     = useState({})
  const [directDonors, setDirectDonors] = useState([])
  const [directDonorsLoading, setDirectDonorsLoading] = useState(false)
  const [directDonorsError, setDirectDonorsError] = useState('')
  const [others, setOthers]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)

  const coreStudentSlugs = new Set(studentsData.map(s => s.slug))

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      // Fetch stats + donors from existing endpoint
      let statsData = {}
      let donors = {}
      const statsRes = await fetch(`${STATS_URL}?t=${Date.now()}`).then(r => r.json()).catch(() => ({ success: false }))
      if (statsRes.success) {
        statsData = statsRes.stats || {}
        // student-stats now returns donors map too
        if (statsRes.donors) {
          for (const [slug, donorList] of Object.entries(statsRes.donors)) {
            const normalizedSlug = normalizeSlug(slug)
            donors[normalizedSlug] = donorList
          }
        }
        setStatsMap(statsData)
      }

      // Try to fetch donor details from Neon directly (more up-to-date)
      try {
        const rows = await neonQuery(
          `SELECT DISTINCT ON (COALESCE(payment_id, id::text))
             payment_id, referred_by, donor_name, amount, subscription_id, created_at
           FROM donations
           WHERE status = 'completed'
             AND (
               referred_by IS NOT NULL
               OR payment_id IN ('pay_SsEQWRGPIRHLq8', 'pay_SsHg1oiatK8TmM', 'pay_SsHgloiatK8TmM', 'pay_SrF4gAvJhBEHiC', 'pay_SshXSSuHm9lyGu', 'pay_St7UrIAgPTLJn0', 'pay_St7UrIAgPTLJnO', 'pay_Ssr6HIpnunImUE', 'pay_Srk4B6w59dVI8d', 'pay_SsLxhIkLusDKsu')
             )
           ORDER BY COALESCE(payment_id, id::text), created_at DESC`
        )
        const neonDonors = {}
        for (const row of rows) {
          const sourceSlug = row.referred_by || PAYMENT_SLUG_OVERRIDES[row.payment_id]
          if (!sourceSlug) continue
          const normalizedSlug = normalizeSlug(sourceSlug)
          const entry = {
            paymentId: row.payment_id || null,
            name:   row.donor_name || 'Anonymous',
            amount: Number(row.amount),
            date:   new Date(row.created_at).toISOString().split('T')[0],
            type:   row.subscription_id ? 'SIP' : 'One-time',
          }
          if (!neonDonors[normalizedSlug]) neonDonors[normalizedSlug] = []
          neonDonors[normalizedSlug].push(entry)
        }
        // Only replace student-stats donors if Neon returned actual data
        if (Object.keys(neonDonors).length > 0) {
          donors = neonDonors
        }
      } catch (neonErr) {
        console.error('[Neon] query failed, using student-stats donors as fallback:', neonErr?.message ?? String(neonErr))
      }

      donors = applyManualDonorOverrides(donors)
      setDonorsMap(donors)

      // Fetch others (self-registered donation links)
      const othersRes = await fetch(OTHERS_URL).then(r => r.json()).catch(() => ({ success: false }))
      if (othersRes.success && othersRes.links) {
        const otherStudents = othersRes.links
          .filter(link => (
            link.show_on_dashboard !== false &&
            link.is_active !== false &&
            link.slug &&
            !coreStudentSlugs.has(link.slug)
          ))
          .map((link, idx) => {
            const d = donors[link.slug] || []
            return {
              id: studentsData.length + idx + 1,
              name: link.student_name || 'Anonymous',
              batch: 5,
              slug: link.slug,
              rollNo: link.roll_no || `OTHER-${String(idx + 1).padStart(2, '0')}`,
              donorsCollected:      d.length,
              donorTarget:          100,
              sipConversions:       d.filter(x => x.type === 'SIP').length,
              totalAmountCollected: d.reduce((sum, x) => sum + x.amount, 0),
              sipMonthlyAmount:     (statsData[link.slug] || {}).sipMonthlyAmount || 0,
              donors: d,
            }
          })
        setOthers(otherStudents)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshData = () => fetchData(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchDirectDonors = async (password) => {
    const cleaned = (password || '').trim()
    if (!cleaned) {
      setDirectDonorsError('Please enter password')
      return false
    }

    setDirectDonorsLoading(true)
    setDirectDonorsError('')

    try {
      // Fetch ALL donations from Neon (both personalized and direct)
      const rows = await neonQuery(
        `SELECT donor_name, amount, subscription_id, created_at, referred_by
         FROM donations
         WHERE status = 'completed'
         ORDER BY created_at DESC`
      )

      const allDonors = rows.map(row => ({
        name: row.donor_name || 'Anonymous',
        amount: Number(row.amount),
        date: new Date(row.created_at).toISOString().split('T')[0],
        type: row.subscription_id ? 'SIP' : 'One-time',
        referredBy: row.referred_by || null,
      }))

      setDirectDonors(allDonors)
      return true
    } catch (err) {
      setDirectDonorsError('Unable to load donations')
      setDirectDonors([])
      return false
    } finally {
      setDirectDonorsLoading(false)
    }
  }

  const students = [
    ...studentsData.map(s => {
      const donors = donorsMap[s.slug] || []
      const stats = statsMap[s.slug] || {}
      return {
        ...s,
        donorsCollected: donors.length,
        sipConversions: donors.filter(d => d.type === 'SIP').length,
        totalAmountCollected: donors.reduce((sum, d) => sum + d.amount, 0),
        sipMonthlyAmount: stats.sipMonthlyAmount || 0,
        donors,
      }
    }),
    ...others,
  ]

  return (
    <StudentsContext.Provider value={{
      students,
      loading,
      refreshing,
      directDonors,
      directDonorsLoading,
      directDonorsError,
      fetchDirectDonors,
      refreshData,
    }}>
      {children}
    </StudentsContext.Provider>
  )
}

export const useStudents = () => useContext(StudentsContext).students
export const useStudentsLoading = () => useContext(StudentsContext).loading
export const useStudentsRefreshing = () => useContext(StudentsContext).refreshing
export const useDirectDonors = () => useContext(StudentsContext).directDonors
export const useDirectDonorsLoading = () => useContext(StudentsContext).directDonorsLoading
export const useDirectDonorsError = () => useContext(StudentsContext).directDonorsError
export const useFetchDirectDonors = () => useContext(StudentsContext).fetchDirectDonors
export const useRefreshData = () => useContext(StudentsContext).refreshData
