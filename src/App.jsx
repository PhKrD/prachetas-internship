import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MotivationStrip from './components/MotivationStrip'
import CampaignStats from './components/CampaignStats'
import ImpactSection from './components/ImpactSection'
import BatchOverview from './components/BatchOverview'
import Leaderboard from './components/Leaderboard'
import StudentGrid from './components/StudentGrid'
import StudentProfile from './components/StudentProfile'
import Footer from './components/Footer'

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeBatch, setActiveBatch]         = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {selectedStudent ? (
        <StudentProfile
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      ) : (
        <>
          <Hero />
          <MotivationStrip />
          <CampaignStats />
          <ImpactSection />
          <MotivationStrip />
          <BatchOverview activeBatch={activeBatch} onSelectBatch={setActiveBatch} />
          <Leaderboard onSelectStudent={setSelectedStudent} />
          <StudentGrid activeBatch={activeBatch} onSelectStudent={setSelectedStudent} />
          <Footer />
        </>
      )}
    </div>
  )
}

export default App
