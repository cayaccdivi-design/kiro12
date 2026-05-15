import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Filter, Search, Star, Coins, CheckCircle, X, Eye, Zap, Lock } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/ui/Modal'

const PRODUCTS = [
  { id:'th-01', title:'Gaming Thumbnail · Neon', desc:'Thumbnail YouTube tone neon gaming channel. PSD + Figma.', category:'thumbnail', type:'static', price:80000, ratio:'16/9', gradient:'linear-gradient(135deg,#ff2e63,#7c5cff,#08d9d6)', icon:'▶', tag:'YT Gaming', rating:4.9, sold:234 },
  { id:'th-02', title:'Vlog Thumbnail · Cinematic', desc:'Layout cinematic cho vlog du lịch — gradient mềm, typo lớn.', category:'thumbnail', type:'static', price:60000, ratio:'16/9', gradient:'linear-gradient(135deg,#ffb56b,#ff5edb)', icon:'✈', tag:'Vlog', rating:4.8, sold:189 },
  { id:'th-03', title:'Animated Thumbnail · Motion', desc:'Thumbnail có animation glow & particle — chuẩn video editor.', category:'thumbnail', type:'animated', price:150000, ratio:'16/9', gradient:'linear-gradient(135deg,#00f5a0,#00d9f5,#7c5cff)', icon:'✦', tag:'Motion', rating:5.0, sold:89, badge:'HOT' },
  { id:'lg-01', title:'Minimal Logo · Mono', desc:'Logo monogram tối giản, vector SVG + AI.', category:'logo', type:'static', price:120000, ratio:'1/1', gradient:'linear-gradient(135deg,#1a1a2e,#4dd0ff)', icon:'N', tag:'Mono', rating:4.7, sold:156 },
  { id:'lg-02', title:'Animated Logo · Reveal', desc:'Logo animation reveal cho intro video. Lottie + MP4.', category:'logo', type:'animated', price:220000, ratio:'1/1', gradient:'linear-gradient(135deg,#7c5cff,#ff5edb)', icon:'✦', tag:'Lottie', rating:4.9, sold:67, badge:'NEW' },
  { id:'lg-03', title:'Esport Logo · Mascot', desc:'Logo mascot cho team esport, file vector chỉnh sửa.', category:'logo', type:'static', price:180000, ratio:'1/1', gradient:'linear-gradient(135deg,#ff2e63,#ffd166)', icon:'⚔', tag:'Esport', rating:4.8, sold:102 },
  { id:'bs-01', title:'Shopee Banner · Sale Flash', desc:'Banner sale flash cho shop Shopee/Lazada, multi-size.', category:'banner-shop', type:'static', price:100000, ratio:'5/2', gradient:'linear-gradient(135deg,#ff5e62,#ff9966)', icon:'🛍', tag:'Sale', rating:4.6, sold:321 },
  { id:'bs-02', title:'Shop Banner · Animated GIF', desc:'Banner shop động dạng GIF, phù hợp marketplace.', category:'banner-shop', type:'animated', price:180000, ratio:'5/2', gradient:'linear-gradient(135deg,#2bf2c0,#4dd0ff,#7c5cff)', icon:'⚡', tag:'GIF', rating:4.8, sold:78 },
  { id:'yt-01', title:'YouTube Banner · Tech', desc:'Channel art cho kênh tech/review, 2560x1440 chuẩn YT.', category:'banner-youtube', type:'static', price:120000, ratio:'16/9', gradient:'linear-gradient(135deg,#0f2027,#2c5364,#00d9f5)', icon:'▶', tag:'Tech', rating:4.7, sold:203 },
  { id:'yt-02', title:'YouTube Banner · Animated', desc:'Banner YT có hiệu ứng động export MP4 cho intro stream.', category:'banner-youtube', type:'animated', price:200000, ratio:'16/9', gradient:'linear-gradient(135deg,#ff2e63,#7c5cff,#08d9d6)', icon:'✦', tag:'Motion', rating:5.0, sold:44, badge:'HOT' },
  { id:'dc-01', title:'Discord Banner · Aesthetic', desc:'Banner server Discord aesthetic — soft purple tone.', category:'banner-discord', type:'static', price:90000, ratio:'3/1', gradient:'linear-gradient(135deg,#5865f2,#7c5cff,#ff5edb)', icon:'#', tag:'Aesthetic', rating:4.8, sold:167 },
  { id:'dc-02', title:'Discord Banner · Live Gradient', desc:'Banner Discord gradient động loop liên tục, xuất GIF.', category:'banner-discord', type:'animated', price:160000, ratio:'3/1', gradient:'linear-gradient(135deg,#2bf2c0,#4dd0ff,#7c5cff,#ff5edb)', icon:'✦', tag:'Live', rating:4.9, sold:55 },
]

const CATEGORIES = [
  { value:'all', label:'Tất cả' },
  { value:'thumbnail', label:'Thumbnail' },
  { value:'logo', label:'Logo' },
  { value:'banner-shop', label:'Banner Shop' },
  { value:'banner-youtube', label:'Banner YouTube' },
  { value:'banner-discord', label:'Banner Discord' },
]

const TYPES = [
  { value:'all', label:'Tất cả' },
  { value:'static', label:'Tĩnh' },
  { value:'animated', label:'Động ✦' },
]

function ProductCard({ p, onClick }) {
  const { isOwned } = useAppStore()
  const owned = isOwned(p.id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onClick(p)}
      className="glass-card cursor-pointer overflow-hidden group"
      style={{ '--ratio': p.ratio }}>

      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: p.ratio, background: p.gradient }}>
        {/* Glass highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30" />

        {/* Animated cards */}
        {p.type === 'animated' && (
          <div className="absolute inset-0" style={{ background: p.gradient, backgroundSize: '200% 200%', animation: 'gradient 4s ease infinite' }} />
        )}

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-white/80 select-none" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            {p.icon}
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/40 text-white/80 backdrop-blur-sm border border-white/10">
            {p.tag}
          </span>
          {p.badge && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm
              ${p.badge === 'HOT' ? 'bg-rose-500/80 text-white' : 'bg-brand-500/80 text-white'}`}>
              {p.badge}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm border
            ${p.type === 'animated' ? 'bg-brand-500/70 text-white border-brand-400/40' : 'bg-black/40 text-white/60 border-white/10'}`}>
            {p.type === 'animated' ? '✦ Động' : 'Tĩnh'}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-1.5 hover:bg-white/25 transition-all">
            <Eye size={14} /> Xem chi tiết
          </button>
        </div>

        {owned && (
          <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-sm font-semibold">
              <CheckCircle size={15} /> Đã sở hữu
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">{p.category.replace('-', ' ')}</p>
        <h3 className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-1">{p.title}</h3>
        <p className="text-xs text-white/40 line-clamp-1 mb-3">{p.desc}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white/50">{p.rating} · {p.sold} đã bán</span>
          </div>
          <div className="flex items-center gap-1 text-brand-300 font-bold font-display text-sm">
            <Coins size={13} className="text-yellow-400" />
            {p.price.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ProductModal({ product, onClose }) {
  const { user, deductBalance } = useAuthStore()
  const { addOwned, isOwned, toast } = useAppStore()
  const navigate = useNavigate()
  const owned = product ? isOwned(product.id) : false

  const buy = () => {
    if (!user) { toast('Vui lòng đăng nhập để mua hàng', 'warn', 'Chưa đăng nhập'); navigate('/auth'); return }
    if (user.balance < product.price) {
      toast(`Cần thêm ${(product.price - user.balance).toLocaleString('vi-VN')}đ để mua sản phẩm này`, 'error', 'Không đủ số dư')
      return
    }
    deductBalance(product.price)
    addOwned(product.id)
    toast(`Đã mua "${product.title}" thành công! 🎉`, 'success', 'Mua hàng thành công')
    onClose()
  }

  if (!product) return null
  return (
    <Modal open={!!product} onClose={onClose} size="lg">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Preview */}
        <div className="relative overflow-hidden rounded-tl-3xl rounded-bl-none md:rounded-bl-3xl rounded-tr-3xl md:rounded-tr-none"
          style={{ aspectRatio: '4/3', background: product.gradient }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
          {product.type === 'animated' && (
            <div className="absolute inset-0" style={{ background: product.gradient, backgroundSize: '200% 200%', animation: 'gradient 4s ease infinite' }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-white/70" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              {product.icon}
            </span>
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/40 text-white backdrop-blur-sm border border-white/10">
              {product.tag}
            </span>
            {product.type === 'animated' && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/70 text-white backdrop-blur-sm">✦ Động</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 flex flex-col">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{product.category.replace('-', ' ')}</p>
          <h2 className="font-display text-xl font-bold text-white mb-2">{product.title}</h2>
          <p className="text-sm text-white/50 leading-relaxed mb-4">{product.desc}</p>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_,i) => (
                <Star key={i} size={13} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
              ))}
              <span className="text-xs text-white/40 ml-1">{product.rating}</span>
            </div>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/40">{product.sold} đã bán</span>
          </div>

          <div className="space-y-2 mb-5">
            {['File gốc PSD + Figma', 'Font chữ miễn phí đi kèm', 'Hướng dẫn chỉnh sửa', 'Hỗ trợ sau mua hàng'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" /> {f}
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
              <span className="text-sm text-white/60">Giá:</span>
              <span className="font-display text-xl font-bold text-yellow-400 flex items-center gap-1.5">
                <Coins size={16} /> {product.price.toLocaleString('vi-VN')}đ
              </span>
            </div>

            {user && (
              <div className="flex items-center justify-between px-4 py-2 text-xs">
                <span className="text-white/30">Số dư của bạn:</span>
                <span className={user.balance >= product.price ? 'text-emerald-400' : 'text-rose-400'}>
                  {user.balance.toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}

            {owned ? (
              <button disabled className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Đã sở hữu
              </button>
            ) : (
              <button onClick={buy}
                className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
                {user ? (
                  <><Zap size={15} /> Mua ngay — {product.price.toLocaleString('vi-VN')}đ</>
                ) : (
                  <><Lock size={15} /> Đăng nhập để mua</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function ShopPage() {
  const [cat, setCat] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = PRODUCTS.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false
    if (type !== 'all' && p.type !== type) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 badge mb-2">
            <ShoppingBag size={12} /> Cửa hàng
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Tài nguyên <span className="grad">thiết kế</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">{filtered.length} sản phẩm</p>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(110,75,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                ${cat === c.value ? 'bg-brand-500 text-white shadow-glow-sm' : 'glass text-white/50 hover:text-white hover:bg-white/[0.06]'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                ${type === t.value ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'glass text-white/50 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <ProductCard key={p.id} p={p} onClick={setSelected} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 text-white/30">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy sản phẩm phù hợp</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
