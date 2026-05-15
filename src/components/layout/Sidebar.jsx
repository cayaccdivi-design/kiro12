import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Gift, Scissors,
  FolderOpen, LogOut, X, ChevronLeft, ChevronRight,
  Sparkles, Zap, Layers, LayoutGrid
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppStore } from '../../store/useAppStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/shop',       icon: ShoppingBag,     label: 'Cửa hàng' },
  { to: '/gift',       icon: Gift,            label: 'Hộp quà',    badge: 'HOT' },
  { to: '/remove-bg',  icon: Scissors,        label: 'Xóa nền AI', badge: 'AI' },
  { to: '/psd-editor', icon: Layers,          label: 'PSD Editor',  badge: 'NEW' },
  { to: '/resources',  icon: FolderOpen,      label: 'Tài nguyên' },
  { to: '/collage',    icon: LayoutGrid,      label: 'Ghép ảnh',   badge: 'NEW' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const isAdmin = useAuthStore(s => s.isAdmin())
  const { sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, toast } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast('Đã đăng xuất', 'success', 'Hẹn gặp lại!')
    navigate('/auth')
  }

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]',
        !sidebarOpen && !mobile && 'justify-center px-2')}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shadow-glow-sm">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-dark-200 animate-pulse" />
        </div>
        <AnimatePresence>
          {(sidebarOpen || mobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-display font-bold text-white text-lg leading-none">NOVA</p>
              <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">AI Studio</p>
            </motion.div>
          )}
        </AnimatePresence>
        {mobile && (
          <button onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge, end }) => {
          if (to === '/psd-editor' && !isAdmin) return null
          return (
          <NavLink key={to} to={to} end={end}
            onClick={() => mobile && setMobileSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'relative flex items-center gap-3 rounded-xl transition-all duration-200 group',
              sidebarOpen || mobile ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center',
              isActive
                ? 'bg-brand-500/20 text-white border border-brand-500/30'
                : 'text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]'
            )}>
            {({ isActive }) => (<>
              {isActive && (
                <motion.div layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/15 to-cyan-500/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
              <div className={clsx('relative flex-shrink-0 transition-colors',
                isActive ? 'text-brand-300' : 'text-white/40 group-hover:text-white/70')}>
                <Icon size={18} />
              </div>
              <AnimatePresence>
                {(sidebarOpen || mobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="relative text-sm font-medium flex-1 truncate">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge && (sidebarOpen || mobile) && (
                <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                  badge === 'AI' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : badge === 'NEW' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')}>
                  {badge}
                </span>
              )}
            </>)}
          </NavLink>
          )
        })}
      </nav>

      {/* User + Actions */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={clsx('w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-all text-sm',
              !sidebarOpen && 'justify-center')}>
            {sidebarOpen
              ? <><ChevronLeft size={16} /><span className="text-xs">Thu gọn</span></>
              : <ChevronRight size={16} />}
          </button>
        )}

        {user && (
          <div className={clsx('flex items-center gap-3 px-2 py-2',
            !sidebarOpen && !mobile && 'justify-center')}>
            <img src={user.avatar} alt={user.name}
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-white/10" />
            <AnimatePresence>
              {(sidebarOpen || mobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {(sidebarOpen || mobile) && (
              <button onClick={handleLogout} title="Đăng xuất"
                className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0">
                <LogOut size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 64 }}
        transition={{ duration: 0.25, ease: [0.22, 0.8, 0.22, 1] }}
        className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.025)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}>
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden"
              style={{
                background: 'rgba(14,14,24,0.95)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(32px)',
              }}>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
