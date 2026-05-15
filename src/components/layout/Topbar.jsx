import { Link, useNavigate } from 'react-router-dom'
import { Menu, Coins, LogIn, UserPlus, Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppStore } from '../../store/useAppStore'

export default function Topbar({ title = '' }) {
  const { user } = useAuthStore()
  const { setMobileSidebarOpen } = useAppStore()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
      style={{
        background: 'rgba(12,12,20,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
      }}>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
        <Menu size={20} />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="font-display font-semibold text-white/90 text-base hidden sm:block">{title}</h1>
      )}

      {/* Search bar */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input placeholder="Tìm kiếm sản phẩm, tài nguyên..."
            className="w-full pl-8 pr-4 py-2 rounded-xl text-sm text-white/70 placeholder-white/25 outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(110,75,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <>
            {/* Balance pill */}
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/topup')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(250,204,21,0.1)',
                border: '1px solid rgba(250,204,21,0.25)',
                color: '#fde047',
              }}>
              <Coins size={15} className="text-yellow-400" />
              <span>{user.balance.toLocaleString('vi-VN')}đ</span>
            </motion.button>

            {/* Notif */}
            <button className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-400" />
            </button>

            {/* Avatar */}
            <button onClick={() => navigate('/topup')} className="flex items-center gap-2 group">
              <img src={user.avatar} alt={user.name}
                className="w-8 h-8 rounded-xl object-cover border border-white/10 group-hover:border-brand-400/50 transition-all" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/auth?tab=login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <LogIn size={15} />
              Đăng nhập
            </Link>
            <Link to="/auth?tab=register"
              className="btn-primary flex items-center gap-1.5 text-xs">
              <UserPlus size={14} />
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
