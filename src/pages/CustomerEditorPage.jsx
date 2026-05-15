import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva'
import { Download, ArrowLeft, Type, Image as ImageIcon, Upload, User, Star, AlertCircle } from 'lucide-react'
import { useShopStore } from '../store/useShopStore'
import { useAppStore } from '../store/useAppStore'

// ── useKonvaImage hook ─────────────────────────────────────────────────────────
function useKonvaImage(dataUrl) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!dataUrl) { setImg(null); return }
    const image = new window.Image()
    image.src = dataUrl
    image.onload = () => setImg(image)
  }, [dataUrl])
  return img
}

// ── FieldInput component ───────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const fileRef = useRef(null)

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    color: 'rgba(255,255,255,0.85)',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    fontSize: 13,
    resize: 'vertical',
  }

  const handleImageUpload = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(f)
  }

  if (field.type === 'text') {
    return (
      <div className="space-y-1.5">
        <label className="text-[11px] text-white/40 uppercase tracking-wider flex items-center gap-1.5 block">
          <Type size={11} className="text-brand-400" /> {field.label}
        </label>
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={2}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'rgba(110,75,255,0.55)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
        />
      </div>
    )
  }

  // Image field
  const isCircle = field.role === 'avt_png'
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] text-white/40 uppercase tracking-wider flex items-center gap-1.5 block">
        {isCircle ? <User size={11} className="text-cyan-400" /> : <ImageIcon size={11} className="text-cyan-400" />}
        {field.label}
        {isCircle && <span className="text-[9px] text-cyan-500 ml-1">• Crop tron</span>}
      </label>
      <div
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
        style={{
          border: '1px dashed rgba(77,208,255,0.3)',
          background: 'rgba(77,208,255,0.04)',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(77,208,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77,208,255,0.3)'}
      >
        {value ? (
          <div className="flex items-center gap-3 w-full">
            <img
              src={value}
              alt={field.label}
              className="object-cover flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: isCircle ? '50%' : 8,
                border: '2px solid rgba(77,208,255,0.3)',
              }}
            />
            <div className="min-w-0">
              <p className="text-xs text-white/60">Anh da tai len</p>
              <p className="text-[10px] text-white/30 mt-0.5">Click de thay doi</p>
            </div>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-cyan-400/60" />
            <p className="text-xs text-white/40">Click de tai anh len</p>
            <p className="text-[10px] text-white/25">PNG, JPG, WebP</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  )
}

// ── KonvaOverlayText ───────────────────────────────────────────────────────────
function KonvaOverlayText({ field, value, scale, isSelected, onSelect, onDragEnd }) {
  const nodeRef = useRef(null)
  const fontStyle = [field.bold ? 'bold' : '', field.italic ? 'italic' : ''].filter(Boolean).join(' ') || 'normal'
  if (!value) return null
  return (
    <KonvaText
      ref={nodeRef}
      text={value}
      x={(field.x || 0) * scale}
      y={(field.y || 0) * scale}
      width={(field.width || 200) * scale}
      fontFamily={field.fontFamily || 'Inter'}
      fontSize={(field.fontSize || 16) * scale}
      fill={field.color || '#ffffff'}
      fontStyle={fontStyle}
      onClick={() => onSelect && onSelect(field.role)}
      onTap={() => onSelect && onSelect(field.role)}
      draggable
      onDragEnd={e => onDragEnd && onDragEnd(field.role, e.target.x() / scale, e.target.y() / scale)}
    />
  )
}

// ── KonvaOverlayImage ──────────────────────────────────────────────────────────
function KonvaOverlayImage({ field, value, scale, isSelected, onSelect, onDragEnd }) {
  const img = useKonvaImage(value)
  if (!img) return null
  const isCircle = field.shape === 'circle'
  const x = (field.x || 0) * scale
  const y = (field.y || 0) * scale
  const w = (field.width || 100) * scale
  const h = (field.height || 100) * scale
  return (
    <KonvaImage
      image={img}
      x={x}
      y={y}
      width={w}
      height={h}
      onClick={() => onSelect && onSelect(field.role)}
      onTap={() => onSelect && onSelect(field.role)}
      draggable
      onDragEnd={e => onDragEnd && onDragEnd(field.role, e.target.x() / scale, e.target.y() / scale)}
      clipFunc={isCircle ? (ctx) => {
        const cx = w / 2
        const cy = h / 2
        const r = Math.min(w, h) / 2
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
      } : undefined}
    />
  )
}

// ── NotFoundView ───────────────────────────────────────────────────────────────
function NotFoundView({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4"
      style={{ background: '#0a0a14' }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertCircle size={32} className="text-rose-400" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-2">San pham khong ton tai</h2>
        <p className="text-sm text-white/40">San pham nay khong duoc tim thay trong cua hang.</p>
      </div>
      <button onClick={onBack} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
        <ArrowLeft size={16} /> Quay lai cua hang
      </button>
    </div>
  )
}

// ── NotOwnedView ───────────────────────────────────────────────────────────────
function NotOwnedView({ onBuy }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4"
      style={{ background: '#0a0a14' }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(110,75,255,0.1)', border: '1px solid rgba(110,75,255,0.2)' }}>
        <Star size={32} className="text-brand-400" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Ban chua so huu san pham nay</h2>
        <p className="text-sm text-white/40">Hay mua san pham de su dung trinh chinh sua.</p>
      </div>
      <button onClick={onBuy} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
        <ArrowLeft size={16} /> Xem cua hang
      </button>
    </div>
  )
}

// ── Main CustomerEditorPage ────────────────────────────────────────────────────
export default function CustomerEditorPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = useShopStore(s => s.getProduct(productId))
  const { isOwned, toast } = useAppStore()

  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 450 })
  const [selectedRole, setSelectedRole] = useState(null)
  const [overrides, setOverrides] = useState({})

  const [customValues, setCustomValues] = useState(() => {
    if (!product?.editableFields) return {}
    const init = {}
    for (const f of product.editableFields) {
      init[f.role] = f.defaultValue || ''
    }
    return init
  })

  // Backfill customValues when product loads (in case store hydrates after mount)
  useEffect(() => {
    if (!product?.editableFields) return
    setCustomValues(prev => {
      const init = { ...prev }
      let changed = false
      for (const f of product.editableFields) {
        if (!(f.role in init)) {
          init[f.role] = f.defaultValue || ''
          changed = true
        }
      }
      return changed ? init : prev
    })
  }, [product])

  const bgImg = useKonvaImage(product?.previewDataUrl || null)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height })
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const handleFieldChange = useCallback((role, value) => {
    setCustomValues(prev => ({ ...prev, [role]: value }))
  }, [])

  const handleOverrideDragEnd = useCallback((role, x, y) => {
    setOverrides(prev => ({ ...prev, [role]: { x, y } }))
  }, [])

  const handleDownload = useCallback(() => {
    if (!stageRef.current) {
      toast('Canvas chua san sang', 'error', 'Loi')
      return
    }
    try {
      const dataUrl = stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `nova-custom-${product?.title?.replace(/\s+/g, '-') || 'design'}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast('Da tai ve thanh cong!', 'success', 'Download')
    } catch (err) {
      toast('Loi khi tai ve. Vui long thu lai.', 'error', 'Download loi')
    }
  }, [product, toast])

  if (!product) return <NotFoundView onBack={() => navigate('/shop')} />
  if (!isOwned(productId)) return <NotOwnedView onBuy={() => navigate('/shop')} />

  const editableFields = product.editableFields || []

  const prodW = product.width || 1920
  const prodH = product.height || 1080
  const scale = Math.min(containerSize.w / prodW, containerSize.h / prodH, 1)
  const stageW = prodW * scale
  const stageH = prodH * scale

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#0a0a14' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => navigate('/shop')}
          className="p-1.5 rounded-xl transition-colors text-white/40 hover:text-white hover:bg-white/[0.06]"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Trinh chinh sua</p>
          <h1 className="text-sm font-semibold text-white truncate">{product.title}</h1>
        </div>
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <Download size={14} /> Tai ve
        </button>
      </motion.div>

      {/* Body: 2-column */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={{
            width: 300,
            background: 'rgba(255,255,255,0.025)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Tuy chinh noi dung</h2>
            {editableFields.length > 0 && (
              <p className="text-[10px] text-white/25 mt-0.5">{editableFields.length} truong co the chinh sua</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {editableFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Type size={18} className="text-white/20" />
                </div>
                <p className="text-xs text-white/30 leading-relaxed">
                  San pham nay chua co truong chinh sua.<br />
                  Admin can publish lai voi layer chuan.
                </p>
              </div>
            ) : (
              editableFields.map(field => (
                <motion.div
                  key={field.role}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FieldInput
                    field={field}
                    value={customValues[field.role] ?? field.defaultValue ?? ''}
                    onChange={val => handleFieldChange(field.role, val)}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right panel - Canvas */}
        <div
          ref={containerRef}
          className="flex-1 min-w-0 flex items-center justify-center overflow-hidden"
          style={{ background: '#0a0a10' }}
        >
          {stageW > 0 && stageH > 0 && (
            <Stage
              ref={stageRef}
              width={stageW}
              height={stageH}
            >
              <Layer>
                {bgImg && (
                  <KonvaImage
                    image={bgImg}
                    width={stageW}
                    height={stageH}
                    x={0}
                    y={0}
                  />
                )}

                {editableFields.map(field => {
                  const override = overrides[field.role]
                  const fieldWithOverride = override
                    ? { ...field, x: override.x, y: override.y }
                    : field

                  if (field.type === 'text') {
                    return (
                      <KonvaOverlayText
                        key={field.role}
                        field={fieldWithOverride}
                        value={customValues[field.role] ?? field.defaultValue ?? ''}
                        scale={scale}
                        isSelected={selectedRole === field.role}
                        onSelect={setSelectedRole}
                        onDragEnd={handleOverrideDragEnd}
                      />
                    )
                  }
                  if (field.type === 'image' && customValues[field.role]) {
                    return (
                      <KonvaOverlayImage
                        key={field.role}
                        field={fieldWithOverride}
                        value={customValues[field.role]}
                        scale={scale}
                        isSelected={selectedRole === field.role}
                        onSelect={setSelectedRole}
                        onDragEnd={handleOverrideDragEnd}
                      />
                    )
                  }
                  return null
                })}
              </Layer>
            </Stage>
          )}
        </div>
      </div>
    </div>
  )
}
