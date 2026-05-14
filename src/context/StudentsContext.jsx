import { createContext, useContext, useState, useEffect } from 'react'
import { studentsData } from '../data/studentsData'

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'

const StudentsContext = createContext(null)

export const StudentsProvider = ({ children }) => {
  const [statsMap, setStatsMap] = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(STATS_URL)
      .then(r => r.json())
      .then(data => { if (data.success) setStatsMap(data.stats) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const students = studentsData.map(s => ({
    ...s,
    ...(statsMap[s.slug] ?? {
      donorsCollected:      0,
      sipConversions:       0,
      totalAmountCollected: 0,
      sipMonthlyAmount:     0,
    }),
  }))

  return (
    <StudentsContext.Provider value={{ students, loading }}>
      {children}
    </StudentsContext.Provider>
  )
}

export const useStudents = () => useContext(StudentsContext).students
export const useStudentsLoading = () => useContext(StudentsContext).loading
