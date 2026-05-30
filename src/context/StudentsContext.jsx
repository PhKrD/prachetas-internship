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

// Manual attribution ONLY for payments NOT recorded in the Neon donations table
// (off-channel: PhonePe UTR, UPI direct, Paytm ref, manual cash/anonymous).
// Razorpay payments are tracked in DB and attributed via referred_by — DO NOT duplicate them here.
const MANUAL_DONOR_OVERRIDES = {
  'parth-patil': [
    {
      paymentId: 'utr_485020494237',
      name: 'PhonePe Donor',
      amount: 500,
      date: '2026-05-20',
      type: 'One-time',
    },
    {
      paymentId: 'gpay_615092411626',
      name: 'NILESH SIDDHESHWAR PAWALE',
      amount: 200,
      date: '2026-05-30',
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
  'nikhil-shripad-patankar': [
    {
      paymentId: 'gpay_650985656711',
      name: 'NISHAD SUSHANT NAIK',
      amount: 100,
      date: '2026-05-23',
      type: 'One-time',
    },
  ],
}

const sigOf = (d) => `${String(d.name || '').trim().toLowerCase()}|${Number(d.amount)}|${d.date}|${d.type}`

const applyManualDonorOverrides = (baseDonors) => {
  const merged = { ...baseDonors }

  for (const [slug, manualDonors] of Object.entries(MANUAL_DONOR_OVERRIDES)) {
    const existing = [...(merged[slug] || [])]
    const existingIds = new Set(existing.map(d => d.paymentId).filter(Boolean))
    const existingSig = new Set(existing.map(sigOf))

    for (const donor of manualDonors) {
      const sig = sigOf(donor)
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

// Browser-compatible Neon query using CORS proxy
const neonQueryBrowser = async (query) => {
  const proxyUrl = 'https://corsproxy.io/?'
  const targetUrl = NEON_API
  const body = JSON.stringify({ query, params: [] })
  
  const res = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-neon-connection-string': NEON_CONN,
    },
    body,
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
        // student-stats may return multiple slug-variants that normalize to the same
        // canonical student slug — CONCAT lists (with dedup) instead of overwriting.
        // IMPORTANT: dedup only fires when MERGING a second slug variant into an already-
        // populated entry. For the first occurrence we copy as-is, preserving legitimate
        // same-amount same-day payments from the same donor (different transactions).
        if (statsRes.donors) {
          for (const [slug, donorList] of Object.entries(statsRes.donors)) {
            const normalizedSlug = normalizeSlug(slug)
            if (!donors[normalizedSlug]) {
              donors[normalizedSlug] = [...donorList]
            } else {
              const existing = donors[normalizedSlug]
              const existingIds = new Set(existing.map(d => d.paymentId).filter(Boolean))
              const existingSig = new Set(existing.map(sigOf))
              for (const d of donorList) {
                const sig = sigOf(d)
                if ((d.paymentId && existingIds.has(d.paymentId)) || existingSig.has(sig)) continue
                existing.push(d)
                if (d.paymentId) existingIds.add(d.paymentId)
                existingSig.add(sig)
              }
            }
          }
        }
        setStatsMap(statsData)
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
    if (cleaned !== 'palanharkrsnadas') {
      setDirectDonorsError('Incorrect password')
      return false
    }

    setDirectDonorsLoading(true)
    setDirectDonorsError('')

    try {
      // Use student-stats endpoint (already has all donors, no password/CORS issues)
      const res = await fetch(`${STATS_URL}?t=${Date.now()}`)
      const data = await res.json()

      if (!data.success || !data.donors) {
        throw new Error('Invalid response from server')
      }

      // Flatten all donors from all students into a single list
      const allDonors = []
      for (const [slug, donorList] of Object.entries(data.donors)) {
        for (const donor of donorList) {
          allDonors.push({
            ...donor,
            referredBy: slug,
          })
        }
      }

      // Sort by date descending
      allDonors.sort((a, b) => new Date(b.date) - new Date(a.date))

      setDirectDonors(allDonors)
      return true
    } catch (err) {
      console.error('Direct donors fetch error:', err)
      setDirectDonorsError(err.message || 'Unable to load donations')
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
