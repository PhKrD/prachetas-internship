import { createContext, useContext, useState, useEffect } from 'react'
import { neon } from '@neondatabase/serverless'
import { studentsData } from '../data/studentsData'

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'
const OTHERS_URL = 'https://prachetasfoundation.com/.netlify/functions/fundraiser-link?all=true'

const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_D1qzN2kVQ2qO@ep-red-fire-a4o7k5qf.us-east-2.aws.neon.tech/neondb?sslmode=require'

const sql = neon(NEON_DATABASE_URL)

const StudentsContext = createContext(null)

export const StudentsProvider = ({ children }) => {
  const [statsMap, setStatsMap] = useState({})
  const [donorsMap, setDonorsMap] = useState({})
  const [others, setOthers] = useState([])
  const [loading, setLoading]   = useState(true)

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

        // Fetch donors directly from Neon
        let donors = {}
        try {
          const donorRows = await sql`
            SELECT
              referred_by,
              donor_name,
              amount,
              subscription_id,
              subscription_amount,
              created_at
            FROM donations
            WHERE referred_by IS NOT NULL
              AND status = 'completed'
            ORDER BY created_at DESC
          `
          for (const row of donorRows) {
            if (!donors[row.referred_by]) donors[row.referred_by] = []
            donors[row.referred_by].push({
              name: row.donor_name || 'Anonymous',
              amount: Number(row.amount),
              date: new Date(row.created_at).toISOString().split('T')[0],
              type: row.subscription_id ? 'SIP' : 'One-time',
              sipAmount: row.subscription_amount ? Number(row.subscription_amount) : null,
            })
          }
          setDonorsMap(donors)
        } catch (neonErr) {
          console.error('Neon direct query failed:', neonErr)
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
    <StudentsContext.Provider value={{ students, loading }}>
      {children}
    </StudentsContext.Provider>
  )
}

export const useStudents = () => useContext(StudentsContext).students
export const useStudentsLoading = () => useContext(StudentsContext).loading
