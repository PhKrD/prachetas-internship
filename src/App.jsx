import { useState } from 'react'
import { StudentsProvider } from './context/StudentsContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MotivationStrip from './components/MotivationStrip'
import CampaignStats from './components/CampaignStats'
import ImpactSection from './components/ImpactSection'
import BatchOverview from './components/BatchOverview'
import Leaderboard from './components/Leaderboard'
import GroupLeaderboard from './components/GroupLeaderboard'
import StudentGrid from './components/StudentGrid'
import StudentProfile from './components/StudentProfile'
import DirectDonations from './components/DirectDonations'
import Footer from './components/Footer'

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeBatch, setActiveBatch]         = useState(null)

  return (
    <StudentsProvider>
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
            <GroupLeaderboard onSelectStudent={setSelectedStudent} />
            <DirectDonations />
            <StudentGrid activeBatch={activeBatch} onSelectStudent={setSelectedStudent} onSelectBatch={setActiveBatch} />
            <Footer />
          </>
        )}
      </div>
    </StudentsProvider>
  )
}

export default App
