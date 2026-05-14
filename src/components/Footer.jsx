import { Leaf, ExternalLink, Heart } from 'lucide-react'

const Footer = () => (
  <footer className="bg-green-900 text-white py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Leaf size={20} className="text-green-300" />
          </div>
          <div>
            <div className="font-bold text-white">Prachetas Foundation</div>
            <div className="text-green-400 text-xs">COEP Social Internship 2026</div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <a
            href="https://prachetasfoundation.com"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-green-300 hover:text-white transition-colors"
          >
            prachetasfoundation.com <ExternalLink size={13} />
          </a>
          <p className="text-xs text-green-500 flex items-center gap-1">
            Built with <Heart size={11} className="text-red-400" fill="currentColor" /> for a greener planet
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-green-800 text-xs text-green-500 text-center">
        © 2026 Prachetas Foundation. All rights reserved. This dashboard tracks the COEP social internship campaign.
      </div>
    </div>
  </footer>
)

export default Footer
