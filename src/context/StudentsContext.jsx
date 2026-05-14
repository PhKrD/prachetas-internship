import { createContext, useContext, useState, useEffect } from 'react'
import { studentsData } from '../data/studentsData'

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'
const DONORS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-donors'
const OTHERS_URL = 'https://prachetasfoundation.com/.netlify/functions/fundraiser-links'

const StudentsContext = createContext(null)

export const StudentsProvider = ({ children }) => {
  const [statsMap, setStatsMap] = useState({})
  const [donorsMap, setDonorsMap] = useState({})
  const [others, setOthers] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(STATS_URL).then(r => r.json()).catch(() => ({ success: false })),
      fetch(DONORS_URL).then(r => r.json()).catch(() => ({ success: false })),
      fetch(OTHERS_URL).then(r => r.json()).catch(() => ({ success: false })),
    ])
      .then(([statsRes, donorsRes, othersRes]) => {
        console.log('Donors response:', donorsRes)
        if (statsRes.success) setStatsMap(statsRes.stats)
        if (donorsRes.success) {
          console.log('Donors map:', donorsRes.donors)
          setDonorsMap(donorsRes.donors)
        }
        if (othersRes.success) {
          const otherStudents = othersRes.links
            .filter(link => link.showOnDashboard !== false)
            .map((link, idx) => ({
              id: studentsData.length + idx + 1,
              name: link.name || 'Anonymous',
              batch: 5,
              slug: link.slug,
              rollNo: `OTHER-${String(idx + 1).padStart(2, '0')}`,
              donorsCollected: link.donorsCollected || 0,
              donorTarget: 100,
              sipConversions: link.sipConversions || 0,
              totalAmountCollected: link.totalAmountCollected || 0,
              sipMonthlyAmount: link.sipMonthlyAmount || 0,
              donors: link.donors || [],
            }))
          setOthers(otherStudents)
        }
      })
      .finally(() => setLoading(false))
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
