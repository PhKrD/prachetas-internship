import { ExternalLink, Leaf } from 'lucide-react'

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-green-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Leaf className="text-white" size={20} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">Prachetas Foundation</div>
            <div className="text-xs text-green-700 font-semibold tracking-wide">COEP Social Internship 2026</div>
          </div>
        </div>

        <a
          href="https://prachetasfoundation.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
        >
          <span className="hidden sm:inline">Donate Now</span>
          <span className="sm:hidden">Donate</span>
          <ExternalLink size={14} />
        </a>

      </div>
    </div>
  </nav>
)

export default Navbar
