import { createContext, useContext, useState, useEffect } from 'react'
import { studentsData } from '../data/studentsData'

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'
const OTHERS_URL = 'https://prachetasfoundation.com/.netlify/functions/fundraiser-link?all=true'

const NEON_CONN = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'
const NEON_API  = 'https://api.c-3.us-east-1.aws.neon.tech/sql'

const neonQuery = async (query) => {
  const res = await fetch(NEON_API, {
    method: 'POST',
    headers: {
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
  const [others, setOthers]           = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats from existing endpoint
        let statsData = {}
        const statsRes = await fetch(STATS_URL).then(r => r.json()).catch(() => ({ success: false }))
        if (statsRes.success) {
          statsData = statsRes.stats
          setStatsMap(statsData)
        }

        // Fetch donor details + direct donations from Neon via HTTP API
        let donors = {}
        try {
          const rows = await neonQuery(
            `SELECT referred_by, donor_name, amount, subscription_id, created_at
             FROM donations WHERE status = 'completed' ORDER BY created_at DESC`
          )
          const direct = []
          for (const row of rows) {
            const entry = {
              name:   row.donor_name || 'Anonymous',
              amount: Number(row.amount),
              date:   new Date(row.created_at).toISOString().split('T')[0],
              type:   row.subscription_id ? 'SIP' : 'One-time',
            }
            if (row.referred_by) {
              if (!donors[row.referred_by]) donors[row.referred_by] = []
              donors[row.referred_by].push(entry)
            } else {
              direct.push(entry)
            }
          }
          setDonorsMap(donors)
          setDirectDonors(direct)
        } catch (neonErr) {
          const msg = neonErr?.message ?? String(neonErr)
          console.error('[Neon] query failed:', msg)
        }

        // Fetch others (self-registered donation links)
        const othersRes = await fetch(OTHERS_URL).then(r => r.json()).catch(() => ({ success: false }))
        if (othersRes.success && othersRes.links) {
          const otherStudents = othersRes.links
            .filter(link => link.show_on_dashboard !== false && link.is_active !== false)
            .map((link, idx) => {
              const s = statsData[link.slug] || {}
              return {
                id: studentsData.length + idx + 1,
                name: link.student_name || 'Anonymous',
                batch: 5,
                slug: link.slug,
                rollNo: link.roll_no || `OTHER-${String(idx + 1).padStart(2, '0')}`,
                donorsCollected:      s.donorsCollected      || 0,
                donorTarget:          100,
                sipConversions:       s.sipConversions       || 0,
                totalAmountCollected: s.totalAmountCollected || 0,
                sipMonthlyAmount:     s.sipMonthlyAmount     || 0,
                donors: donors[link.slug] || [],
              }
            })
          setOthers(otherStudents)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const students = [
    ...studentsData.map(s => ({
      ...s,
      ...(statsMap[s.slug] ?? {
        donorsCollected:      0,
        sipConversions:       0,
        totalAmountCollected: 0,
        sipMonthlyAmount:     0,
      }),
      donors: donorsMap[s.slug] || [],
    })),
    ...others,
  ]

  return (
    <StudentsContext.Provider value={{ students, loading, directDonors }}>
      {children}
    </StudentsContext.Provider>
  )
}

export const useStudents = () => useContext(StudentsContext).students
export const useStudentsLoading = () => useContext(StudentsContext).loading
export const useDirectDonors = () => useContext(StudentsContext).directDonors
