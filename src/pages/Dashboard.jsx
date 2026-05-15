import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Gift, Scissors, FolderOpen, Layers,
  Coins, ArrowRight, Zap, Star, Sparkles,
  Download, TrendingUp, LayoutDashboard,
  Clock, Activity, CheckCircle2,
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
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 group hover:scale-[1.02]"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
      {/* top-rim highlight */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${c.dot}55, transparent)` }} />
      {/* bottom shimmer line */}
      <div className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${c.dot}33, transparent)` }} />
      {/* hover glow */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
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
        <p className="font-display text-3xl font-bold text-white tracking-tight">{value}</p>
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
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}>
      {/* gradient accent top - always visible slightly */}
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-30 group-hover:opacity-100 transition-opacity"
        style={{ background: gradient }} />
      {/* bg glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.035), transparent 60%)` }} />

      {/* Icon */}
      <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: gradient, boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 20px rgba(110,75,255,0.25)` }}>
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
function FeatureCard({ icon, title, desc, delay, link, accent }) {
  const Wrapper = link ? Link : 'div'
  const accentRgb = accent || '#6e4bff'
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 0.8, 0.22, 1] }}
      className="h-full">
      <Wrapper to={link}
        className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-300 hover:-translate-y-1 block h-full"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}>
        {/* top accent line */}
        <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${accentRgb}, transparent)` }} />
        {/* hover shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${accentRgb}12, transparent 60%)` }} />
        <div className="relative flex flex-col gap-3 flex-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-2xl select-none"
            style={{
              background: `${accentRgb}18`,
              border: `1px solid ${accentRgb}35`,
              backdropFilter: 'blur(8px)',
            }}>{icon}</div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
            <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
          </div>
        </div>
      </Wrapper>
    </motion.div>
  )
}

/* ─── QUICK_ACTIONS ──────────────────────────────────────── */
const QUICK_ACTIONS = [
  { to: '/shop',       icon: ShoppingBag, label: 'Cửa hàng',   desc: '120+ tài nguyên thiết kế cao cấp',   gradient: 'linear-gradient(135deg,#6e4bff,#4dd0ff)', badge: null       },
  { to: '/gift',       icon: Gift,        label: 'Hộp quà',    desc: 'Voucher & mã giảm giá hàng ngày',    gradient: 'linear-gradient(135deg,#10b981,#2bf2c0)', badge: 'HOT'      },
  { to: '/remove-bg',  icon: Scissors,    label: 'Xóa nền AI', desc: 'Tách nền ảnh tự động chỉ 1 giây',    gradient: 'linear-gradient(135deg,#0ea5e9,#4dd0ff)', badge: 'AI'       },
  { to: '/psd-editor', icon: Layers,      label: 'PSD Editor', desc: 'Chỉnh sửa PSD trực tiếp trên web',   gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', badge: 'NEW', adminOnly: true },
  { to: '/resources',  icon: FolderOpen,  label: 'Tài nguyên', desc: '10,000+ PSD, icon, mockup miễn phí', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', badge: null       },
]

const FEATURES = [
  { icon: '🛍️', title: 'Cửa hàng thiết kế',  desc: 'Mua thumbnail, logo, banner PSD chất lượng cao. Chỉnh sửa trực tiếp trên web sau khi mua.',  link: '/shop',       accent: '#6e4bff' },
  { icon: '✂️',  title: 'Xóa nền tự động',    desc: 'Tách nền ảnh chỉ trong 1 giây. Hỗ trợ PNG, JPG. Không cần Photoshop.',                       link: '/remove-bg',  accent: '#0ea5e9' },
  { icon: '📦',  title: 'Kho tài nguyên',      desc: '10,000+ file PSD, icon, mockup miễn phí. Tải về và dùng ngay cho dự án của bạn.',             link: '/resources',  accent: '#8b5cf6' },
  { icon: '🎁',  title: 'Phần thưởng hàng ngày', desc: 'Nhận voucher, coin và ưu đãi hàng ngày. Dùng để mua sản phẩm hoặc xuất ảnh không giới hạn.', link: '/gift',       accent: '#10b981' },
]

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuthStore()
  const isAdmin = useAuthStore(s => s.isAdmin())
  const { owned } = useAppStore()

  // Build activity feed từ dữ liệu thực
  const activities = []
  if (user) {
    activities.push({ icon: '👋', text: `${user.name} đã đăng nhập`, time: 'Vừa xong', color: '#6e4bff' })
  }
  if (owned.length > 0) {
    activities.push({ icon: '🛒', text: `Đã sở hữu ${owned.length} sản phẩm`, time: 'Tài khoản của bạn', color: '#7c5cff' })
  }
  if (user && user.balance > 0) {
    activities.push({ icon: '💰', text: `Số dư: ${user.balance.toLocaleString('vi-VN')}đ`, time: 'Cập nhật mới nhất', color: '#facc15' })
  }
  activities.push({ icon: '🎁', text: 'Có 4 voucher đang chờ bạn', time: 'Hôm nay', color: '#2bf2c0' })
  activities.push({ icon: '📦', text: '10,000+ tài nguyên miễn phí', time: 'Luôn có sẵn', color: '#4dd0ff' })

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
          background: 'linear-gradient(135deg, rgba(110,75,255,0.22) 0%, rgba(77,208,255,0.12) 55%, rgba(43,242,192,0.08) 100%)',
          border: '1px solid rgba(110,75,255,0.35)',
          backdropFilter: 'blur(32px) saturate(200%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
        {/* Orbs */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(110,75,255,0.32) 0%, transparent 70%)' }} />
        <div className="absolute right-24 bottom-0 w-48 h-48 rounded-full pointer-events-none animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(77,208,255,0.22) 0%, transparent 70%)', animationDelay: '1s' }} />
        <div className="absolute left-1/2 -bottom-12 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(43,242,192,0.18) 0%, transparent 70%)' }} />
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

      {/* ── Quick Actions + Activity Feed ── */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Quick Actions - 3/4 width */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Zap size={14} className="text-brand-400" />
            </div>
            <h2 className="font-display text-base font-semibold text-white">Truy cập nhanh</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {QUICK_ACTIONS.map(({ to, icon, label, desc, gradient, badge, adminOnly }, i) => (
              (!adminOnly || isAdmin) && (
                <motion.div key={to}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 + 0.15, ease: [0.34, 1.56, 0.64, 1] }}>
                  <QuickCard to={to} icon={icon} label={label} desc={desc} gradient={gradient} badge={badge} />
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* Activity Feed - 1/4 width */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
          className="lg:w-72 flex-shrink-0 rounded-2xl p-4 flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Activity size={14} className="text-cyan-400" />
              </div>
              <h2 className="font-display text-sm font-semibold text-white">Hoạt động</h2>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-white/10" />
                <span className="text-[11px] text-white/50 truncate max-w-[80px]">{user.name}</span>
              </div>
            )}
          </div>
          {/* User info card nếu đã login */}
          {user && (
            <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2.5"
              style={{ background: 'rgba(110,75,255,0.1)', border: '1px solid rgba(110,75,255,0.2)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(110,75,255,0.2)' }}>
                <Sparkles size={14} className="text-brand-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <div className="space-y-2.5">
            {activities.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.35, ease: [0.22, 0.8, 0.22, 1] }}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-colors hover:bg-white/[0.03]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/80 leading-snug truncate">{a.text}</p>
                  <p className="text-[10px] text-white/35 mt-0.5 flex items-center gap-1">
                    <Clock size={9} />{a.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {!user && (
            <Link to="/auth" className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(110,75,255,0.12)', border: '1px solid rgba(110,75,255,0.25)', color: 'rgba(167,139,250,1)' }}>
              <Sparkles size={12} /> Đăng nhập để xem hoạt động
            </Link>
          )}
        </motion.div>
      </div>

      {/* ── Features ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="font-display text-base font-semibold text-white">Tính năng nổi bật</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08 + 0.25} />
          ))}
        </div>
      </div>

      {/* ── Social proof ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, ease: [0.22, 0.8, 0.22, 1] }}
        className="relative flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl px-6 py-5 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 0 1px rgba(110,75,255,0.15), 0 8px 32px rgba(0,0,0,0.25)',
        }}>
        {/* Animated gradient border top */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(110,75,255,0.6), rgba(77,208,255,0.6), rgba(43,242,192,0.4), transparent)' }} />
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
            <p className="text-base font-bold text-white flex items-center gap-1.5">
              50,000+ designer
              <CheckCircle2 size={14} className="text-cyan-400" />
            </p>
            <p className="text-xs text-white/40">đang tin dùng NOVA AI Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-base font-bold text-white">4.9</span>
          <span className="text-xs text-white/40">/ 5 · <span className="text-white/60 font-medium">2,341</span> đánh giá</span>
        </div>
      </motion.div>
    </div>
  )
}
