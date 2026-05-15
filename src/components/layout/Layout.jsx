import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ToastContainer from '../ui/ToastContainer'
import ChatWidget from '../ui/ChatWidget'

// Animated background blobs
function BgBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="blob w-[600px] h-[600px] bg-brand-600" style={{ top: '-15%', left: '-10%' }} />
      <div className="blob w-[500px] h-[500px] bg-cyan-600" style={{ bottom: '-10%', right: '-8%', opacity: 0.14 }} />
      <div className="blob w-[400px] h-[400px] bg-pink-600" style={{ top: '40%', left: '40%', opacity: 0.1 }} />
      <div className="blob w-[350px] h-[350px] bg-emerald-600" style={{ bottom: '15%', left: '8%', opacity: 0.1 }} />
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
      }} />
    </div>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen relative">
      <BgBlobs />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
      <ChatWidget />
    </div>
  )
}
