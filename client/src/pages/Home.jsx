
import Navbar from '../components/Navbar'
import UploadSection from '../components/UploadSection'

function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-10">
        <UploadSection />
      </div>
    </div>
  )
}

export default Home