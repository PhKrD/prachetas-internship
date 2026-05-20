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
  'aryan-khairkhar-b1': 'aryan-khairkhar-b1',
  'aryan-khairkhar-b4': 'aryan-khairkhar-b4',
  'aman-khandelwal-k3mz': 'aman-khandelwal-k3mz',
  // Add more mappings as needed
}

const normalizeSlug = (slug) => SLUG_MAPPING[slug] || slug

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
      const statsRes = await fetch(STATS_URL).then(r => r.json()).catch(() => ({ success: false }))
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
          `SELECT referred_by, donor_name, amount, subscription_id, created_at
           FROM donations
           WHERE status = 'completed'
             AND referred_by IS NOT NULL
           ORDER BY created_at DESC`
        )
        const neonDonors = {}
        for (const row of rows) {
          const normalizedSlug = normalizeSlug(row.referred_by)
          const entry = {
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
