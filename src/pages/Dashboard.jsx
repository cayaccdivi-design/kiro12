import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Gift, Scissors, FolderOpen,
  Coins, ArrowRight, Zap, Star, Sparkles,
  Download, TrendingUp, LayoutDashboard,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, change, trend, link, accent }) {
  const Wrapper = link ? Link : 'div'
  const colors = {
    purple: { bg: 'rgba(110,75,255,0.12)', border: 'rgba(110,75,255,0.25)', icon: 'text-brand-300', glow: 'rgba(110,75,255,0.35)', dot: '#7c5cff' },
    yellow: { bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)',  icon: 'text-yellow-300', glow: 'rgba(250,204,21,0.3)',  dot: '#facc15' },
    cyan:   { bg: 'rgba(77,208,255,0.1)',  border: 'rgba(77,208,255,0.22)', icon: 'text-cyan-300',   glow: 'rgba(77,208,255,0.35)', dot: '#4dd0ff' },
    green:  { bg: 'rgba(43,242,192,0.1)',  border: 'rgba(43,242,192,0.22)', icon: 'text-teal-300',   glow: 'rgba(43,242,192,0.35)', dot: '#2bf2c0' },
  }
  const c = colors[accent] || colors.purple

  return (
    <Wrapper to={link}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 group"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(20px)',
      }}>
      {/* top-rim highlight */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${c.dot}55, transparent)` }} />
      {/* hover glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)` }} />

      {/* Icon row */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${c.dot}22`, border: `1px solid ${c.dot}40` }}>
          <Icon size={18} className={c.icon} />
        </div>
        {trend === 'up' && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(43,242,192,0.12)', border: '1px solid rgba(43,242,192,0.2)' }}>
            <TrendingUp size={9} /> UP
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="font-display text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs text-white/45 mt-0.5">{label}</p>
      </div>

      {/* Change */}
      {change && (
        <p className={`text-[11px] font-medium flex items-center gap-1 mt-auto ${c.icon}`}>
          {change}
          {link && <ArrowRight size={10} />}
        </p>
      )}
    </Wrapper>
  )
}

/* ─── Quick Action Card ──────────────────────────────────── */
function QuickCard({ to, icon: Icon, label, desc, gradient, badge }) {
  return (
    <Link to={to}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}>
      {/* gradient accent top */}
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: gradient }} />
      {/* bg glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.035), transparent 60%)` }} />

      {/* Icon */}
      <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
        style={{ background: gradient }}>
        <Icon size={22} className="text-white drop-shadow-sm" />
        {badge && (
          <span className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm
            ${badge === 'AI' ? 'bg-cyan-500' : 'bg-rose-500'}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="relative">
        <p className="font-semibold text-white text-sm leading-tight">{label}</p>
        <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
      </div>

      {/* Arrow */}
      <div className="relative mt-auto flex items-center gap-1.5 text-white/25 group-hover:text-white/60 transition-colors text-xs">
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </Link>
  )
}

/* ─── Feature Card ───────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 0.8, 0.22, 1] }}
      className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}>
      {/* hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(110,75,255,0.07), transparent 60%)' }} />
      <div className="relative">
        <div className="text-3xl mb-3 select-none">{icon}</div>
        <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
        <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

/* ─── QUICK_ACTIONS ──────────────────────────────────────── */
const QUICK_ACTIONS = [
  { to: '/shop',      icon: ShoppingBag, label: 'Cửa hàng',   desc: '120+ tài nguyên thiết kế cao cấp',  gradient: 'linear-gradient(135deg,#6e4bff,#4dd0ff)', badge: null },
  { to: '/gift',      icon: Gift,        label: 'Hộp quà',    desc: 'Voucher & mã giảm giá miễn phí',    gradient: 'linear-gradient(135deg,#10b981,#2bf2c0)', badge: 'HOT' },
  { to: '/remove-bg', icon: Scissors,    label: 'Xóa nền AI', desc: 'Tách nền ảnh tự động tức thì',      gradient: 'linear-gradient(135deg,#0ea5e9,#4dd0ff)', badge: 'AI' },
  { to: '/resources', icon: FolderOpen,  label: 'Tài nguyên', desc: '10,000+ PSD, icon, mockup miễn phí', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', badge: null },
]

const FEATURES = [
  { icon: '🎨', title: 'AI Design Studio',   desc: 'Tạo thumbnail, logo, banner chuyên nghiệp với AI trong vài giây.' },
  { icon: '✂️', title: 'Remove Background', desc: 'Xóa nền ảnh tự động với độ chính xác cao nhờ AI model U²-Net.' },
  { icon: '📦', title: 'Premium Resources', desc: 'Kho tài nguyên 10,000+ PSD, icon, mockup cập nhật liên tục.' },
  { icon: '🎁', title: 'Daily Rewards',      desc: 'Nhận voucher và phần thưởng hàng ngày khi sử dụng nền tảng.' },
]

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuthStore()
  const { owned } = useAppStore()

  const stats = [
    { icon: ShoppingBag, label: 'Sản phẩm đã mua', value: owned.length.toString() || '0', change: 'Xem cửa hàng', trend: 'up',     link: '/shop',      accent: 'purple' },
    { icon: Coins,        label: 'Số dư ví',         value: user ? `${user.balance.toLocaleString('vi-VN')}đ` : '0đ', change: 'Nạp thêm',   trend: 'neutral', link: '/topup',     accent: 'yellow' },
    { icon: Download,     label: 'Tài nguyên',        value: '10K+',  change: 'Miễn phí tải',  trend: 'up',     link: '/resources', accent: 'cyan'   },
    { icon: Gift,         label: 'Voucher có sẵn',    value: '4',     change: 'Nhận ngay',     trend: 'up',     link: '/gift',      accent: 'green'  },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Welcome Banner ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.22, 0.8, 0.22, 1] }}
        className="relative overflow-hidden rounded-3xl p-7 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(110,75,255,0.18) 0%, rgba(77,208,255,0.1) 55%, rgba(43,242,192,0.08) 100%)',
          border: '1px solid rgba(110,75,255,0.22)',
        }}>
        {/* Orbs */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(110,75,255,0.28) 0%, transparent 70%)' }} />
        <div className="absolute right-24 bottom-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,208,255,0.18) 0%, transparent 70%)' }} />
        {/* Grid dots */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-medium text-brand-300"
              style={{ background: 'rgba(110,75,255,0.18)', border: '1px solid rgba(110,75,255,0.3)' }}>
              <Sparkles size={12} className="text-brand-300" />
              NOVA AI Studio
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              Chào {user
                ? <span className="grad">{user.name}</span>
                : <span className="grad">bạn</span>}! 👋
            </h1>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              {user
                ? 'Tiếp tục sáng tạo những thiết kế đẳng cấp với sức mạnh AI.'
                : 'Đăng ký miễn phí để truy cập kho tài nguyên và công cụ AI thiết kế.'}
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            {!user ? (
              <>
                <Link to="/auth?tab=register" className="btn-primary flex items-center gap-1.5 text-sm px-5 py-2.5 whitespace-nowrap">
                  <Sparkles size={14} /> Bắt đầu miễn phí
                </Link>
                <Link to="/auth" className="btn-ghost text-sm px-5 py-2.5 whitespace-nowrap">Đăng nhập</Link>
              </>
            ) : (
              <Link to="/shop" className="btn-primary flex items-center gap-1.5 text-sm px-5 py-2.5 whitespace-nowrap">
                <ShoppingBag size={14} /> Vào cửa hàng
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, ease: [0.22, 0.8, 0.22, 1] }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Zap size={14} className="text-brand-400" />
          </div>
          <h2 className="font-display text-base font-semibold text-white">Truy cập nhanh</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ to, icon, label, desc, gradient, badge }, i) => (
            <motion.div key={to}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 + 0.15, ease: [0.34, 1.56, 0.64, 1] }}>
              <QuickCard to={to} icon={icon} label={label} desc={desc} gradient={gradient} badge={badge} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="font-display text-base font-semibold text-white">Tính năng nổi bật</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08 + 0.25} />
          ))}
        </div>
      </div>

      {/* ── Social proof ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, ease: [0.22, 0.8, 0.22, 1] }}
        className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl px-6 py-5"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {[260, 200, 280, 320, 340].map((h, i) => (
              <div key={i} className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold text-white"
                style={{ borderColor: '#0c0c14', background: `hsl(${h},60%,55%)` }}>
                {['A','B','C','D','E'][i]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">50,000+ designer</p>
            <p className="text-xs text-white/40">đang tin dùng NOVA AI Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-sm font-bold text-white">4.9</span>
          <span className="text-xs text-white/40">/ 5 · 2,341 đánh giá</span>
        </div>
      </motion.div>
    </div>
  )
}
