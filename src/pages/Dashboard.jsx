import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Gift, Scissors, FolderOpen, Coins, ArrowRight, Zap, TrendingUp, Users, Star, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'

const QUICK_ACTIONS = [
  { to: '/shop',      icon: ShoppingBag, label: 'Cửa hàng',    desc: '120+ tài nguyên',    color: 'from-brand-600 to-brand-400',   badge: null },
  { to: '/gift',      icon: Gift,        label: 'Hộp quà',     desc: 'Nhận voucher miễn phí', color: 'from-emerald-600 to-teal-400', badge: 'HOT' },
  { to: '/remove-bg', icon: Scissors,    label: 'Xóa nền AI',  desc: 'Tách nền tự động',   color: 'from-cyan-600 to-blue-500',     badge: 'AI' },
  { to: '/resources', icon: FolderOpen,  label: 'Tài nguyên',  desc: '10,000+ assets',     color: 'from-violet-600 to-purple-400', badge: null },
]

const STATS = [
  { icon: ShoppingBag, label: 'Sản phẩm đã mua', value: '24', change: '+3 tháng này', trend: 'up' },
  { icon: Coins,        label: 'Số dư ví',        value: '0đ', change: 'Nạp thêm →',   trend: 'neutral', link: '/topup' },
  { icon: Download,     label: 'Tải xuống',        value: '87', change: '+12 tuần này', trend: 'up' },
  { icon: Gift,         label: 'Voucher đang có',  value: '4',  change: 'Xem ngay →',  trend: 'up', link: '/gift' },
]

function StatCard({ icon: Icon, label, value, change, trend, link }) {
  const Wrapper = link ? Link : 'div'
  return (
    <Wrapper to={link} className={`glass-card p-4 ${link ? 'hover:border-brand-500/30 cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
          <Icon size={18} className="text-brand-400" />
        </div>
        {trend === 'up' && (
          <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
            <TrendingUp size={10} /> Up
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-[11px] text-brand-400 mt-1 flex items-center gap-0.5">
        {change} {link && <ArrowRight size={10} />}
      </p>
    </Wrapper>
  )
}

import { Download } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { owned } = useAppStore()

  const stats = [
    { icon: ShoppingBag, label: 'Sản phẩm đã mua', value: owned.length.toString(), change: 'Xem cửa hàng →', trend: 'up', link: '/shop' },
    { icon: Coins,        label: 'Số dư ví',        value: user ? `${user.balance.toLocaleString('vi-VN')}đ` : '0đ', change: 'Nạp thêm →', trend: 'neutral', link: '/topup' },
    { icon: Download,     label: 'Tài nguyên',       value: '10K+', change: 'Miễn phí tải →', trend: 'up', link: '/resources' },
    { icon: Gift,         label: 'Voucher có sẵn',   value: '4',  change: 'Nhận ngay →', trend: 'up', link: '/gift' },
  ]

  const FEATURES = [
    { icon: '🎨', title: 'AI Design Studio', desc: 'Tạo thumbnail, logo, banner chuyên nghiệp với AI trong vài giây.' },
    { icon: '✂️', title: 'Remove Background', desc: 'Xóa nền ảnh tự động với độ chính xác cao nhờ AI model U²-Net.' },
    { icon: '📦', title: 'Premium Resources', desc: 'Kho tài nguyên 10,000+ PSD, icon, mockup cập nhật liên tục.' },
    { icon: '🎁', title: 'Daily Rewards', desc: 'Nhận voucher và phần thưởng hàng ngày khi sử dụng nền tảng.' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: 'linear-gradient(135deg, rgba(110,75,255,0.2), rgba(77,208,255,0.1), rgba(43,242,192,0.08))' ,
                 border: '1px solid rgba(110,75,255,0.2)' }}>
        {/* Decorative orb */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(110,75,255,0.3), transparent 70%)' }} />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(77,208,255,0.2), transparent 70%)' }} />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-500/30 flex items-center justify-center">
                <Sparkles size={16} className="text-brand-300" />
              </div>
              <span className="text-xs text-brand-300 font-medium uppercase tracking-wider">AI Studio</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Chào {user ? <span className="grad">{user.name}</span> : <span className="grad">bạn</span>}! 👋
            </h1>
            <p className="text-white/50 text-sm max-w-md">
              {user
                ? 'Tiếp tục sáng tạo những thiết kế đẳng cấp với sức mạnh AI.'
                : 'Đăng ký miễn phí để truy cập kho tài nguyên và công cụ AI thiết kế.'}
            </p>
          </div>
          <div className="flex gap-3">
            {!user ? (
              <>
                <Link to="/auth?tab=register" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5">
                  <Sparkles size={14} /> Bắt đầu miễn phí
                </Link>
                <Link to="/auth" className="btn-ghost px-5 py-2.5 text-sm">Đăng nhập</Link>
              </>
            ) : (
              <Link to="/shop" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5">
                <ShoppingBag size={14} /> Vào cửa hàng
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={18} className="text-brand-400" /> Truy cập nhanh
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color, badge }, i) => (
            <motion.div key={to}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 + 0.2 }}>
              <Link to={to}
                className="glass-card p-5 flex flex-col gap-3 h-full hover:border-white/[0.14] group relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(circle, rgba(110,75,255,0.15), transparent 70%)` }} />
                <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <Icon size={20} className="text-white" />
                  {badge && (
                    <span className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                      ${badge === 'AI' ? 'bg-cyan-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm group-hover:text-brand-200 transition-colors">{label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-brand-400 group-hover:translate-x-1 transition-all mt-auto" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
            <Star size={16} className="text-yellow-400" /> Tính năng nổi bật
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="glass-card p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-200 overflow-hidden"
                style={{ background: `hsl(${i * 60}, 70%, 60%)` }} />
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">50,000+ designer</p>
            <p className="text-xs text-white/40">đang sử dụng NOVA AI Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
          <span className="ml-2 text-sm font-semibold text-white">4.9/5</span>
          <span className="text-xs text-white/40 ml-1">(2,341 đánh giá)</span>
        </div>
      </motion.div>
    </div>
  )
}
