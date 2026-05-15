import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva'
import Psd from '@webtoon/psd'
import {
  Upload, Eye, EyeOff, Type, Image as ImageIcon, Layers,
  ZoomIn, ZoomOut, Maximize2, Lock, Star, ChevronLeft,
  ChevronRight, RotateCcw, Bold, Italic, X, Loader,
  PanelLeft, PanelRight, Download, Store, ImagePlus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { detectLayerRole } from '../utils/layerNaming'
import { useAuthStore } from '../store/useAuthStore'
import { useShopStore } from '../store/useShopStore'
import { useAppStore } from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import clsx from 'clsx'

// ── helpers ────────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function detectRatio(w, h) {
  if (!w || !h) return '16/9'
  const r = w / h
  const candidates = [
    { ratio: '16/9', val: 16 / 9 },
    { ratio: '1/1',  val: 1 },
    { ratio: '5/2',  val: 5 / 2 },
    { ratio: '3/1',  val: 3 },
  ]
  let best = candidates[0]
  let bestDiff = Math.abs(r - best.val)
  for (const c of candidates) {
    const diff = Math.abs(r - c.val)
    if (diff < bestDiff) { bestDiff = diff; best = c }
  }
  return best.ratio
}

async function rgbaToDataUrl(rgba, width, height) {
  if (!width || !height) return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imgData = ctx.createImageData(width, height)
  imgData.data.set(rgba)
  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL()
}

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

// ── sub-components ─────────────────────────────────────────────────────────────

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(110,75,255,0.15)' }}>
        <Loader size={22} className="text-brand-400 animate-spin" />
      </div>
      {label && <p className="text-sm text-white/50">{label}</p>}
    </div>
  )
}

function LayerRow({ layer, selected, onSelect, onToggleVisible }) {
  const TypeIcon = layer.type === 'text' ? Type : ImageIcon
  return (
    <motion.div
      layout
      onClick={() => onSelect(layer.id)}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm select-none',
        selected
          ? 'bg-brand-500/20 border border-brand-500/30 text-white'
          : 'text-white/60 hover:bg-white/[0.04] border border-transparent hover:text-white/80'
      )}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggleVisible(layer.id) }}
        className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors"
      >
        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <TypeIcon size={13} className={clsx('flex-shrink-0', selected ? 'text-brand-300' : 'text-white/40')} />
      {layer.type === 'image' && layer.dataUrl && (
        <img
          src={layer.dataUrl}
          alt=""
          className="w-8 h-8 object-cover rounded flex-shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
      )}
      <span className="truncate flex-1 text-xs">{layer.name}</span>
      {(() => {
        const role = detectLayerRole(layer.name)
        if (!role) return null
        return (
          <span
            className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: role.type === 'text' ? 'rgba(110,75,255,0.25)' : 'rgba(77,208,255,0.2)',
              border: role.type === 'text' ? '1px solid rgba(110,75,255,0.4)' : '1px solid rgba(77,208,255,0.35)',
              color: role.type === 'text' ? 'rgba(167,139,250,1)' : 'rgba(77,208,255,1)',
              maxWidth: 72,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={role.label}
          >
            {role.label}
          </span>
        )
      })()}
    </motion.div>
  )
}

function LeftPanel({ show, onClose, layers, selectedId, onSelect, onToggleVisible, isMobile }) {  const panelContent = (
    <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="px-3 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Layers</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/25">{layers.length}</span>
          {isMobile && (
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {[...layers].reverse().map(layer => (
          <LayerRow
            key={layer.id}
            layer={layer}
            selected={layer.id === selectedId}
            onSelect={onSelect}
            onToggleVisible={onToggleVisible}
          />
        ))}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {show && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="left-panel-mobile"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute left-0 top-0 bottom-0 z-30"
            >
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="left-panel"
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="flex-shrink-0"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Right Panel ────────────────────────────────────────────────────────────────

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier', 'Verdana', 'Impact']

function TextControls({ layer, onChange, onReset }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Content</label>
        <textarea
          value={layer.textContent || ''}
          onChange={e => onChange({ textContent: e.target.value })}
          rows={3}
          className="input-glass resize-none text-xs"
          style={{ minHeight: 72 }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Font</label>
          <select
            value={layer.fontFamily || 'Inter'}
            onChange={e => onChange({ fontFamily: e.target.value })}
            className="input-glass text-xs py-2"
          >
            {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Size</label>
          <input
            type="number"
            value={layer.fontSize || 16}
            onChange={e => onChange({ fontSize: Number(e.target.value) })}
            className="input-glass text-xs py-2"
            min={6}
            max={300}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Color</label>
          <input
            type="color"
            value={layer.color || '#ffffff'}
            onChange={e => onChange({ color: e.target.value })}
            className="w-full h-9 rounded-xl cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Style</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onChange({ bold: !layer.bold })}
              className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                layer.bold ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
            >B</button>
            <button
              onClick={() => onChange({ italic: !layer.italic })}
              className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-sm italic transition-all',
                layer.italic ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
            >I</button>
          </div>
        </div>
      </div>
      <button onClick={onReset} className="btn-ghost w-full flex items-center justify-center gap-2 text-xs py-2">
        <RotateCcw size={12} /> Reset to original
      </button>
    </div>
  )
}

function ImageControls({ layer, onChange, onReset }) {
  const fileRef = useRef(null)
  const handleReplace = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange({ dataUrl: ev.target.result })
    reader.readAsDataURL(f)
  }
  return (
    <div className="space-y-4">
      {layer.dataUrl && (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <img src={layer.dataUrl} alt={layer.name} className="w-full object-contain max-h-40" />
        </div>
      )}
      <button
        onClick={() => fileRef.current?.click()}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-xs py-2.5"
      >
        <ImageIcon size={13} /> Replace Image
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={handleReplace} />
      </button>
      <button onClick={onReset} className="btn-ghost w-full flex items-center justify-center gap-2 text-xs py-2">
        <RotateCcw size={12} /> Reset to original
      </button>
    </div>
  )
}

function RightPanel({ show, onClose, selectedLayer, onLayerChange, onResetLayer, isMobile }) {
  const panelContent = (
    <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="px-3 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Properties</span>
        {isMobile && (
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {!selectedLayer ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <PanelRight size={18} className="text-white/20" />
            </div>
            <p className="text-xs text-white/30">Select a layer to edit properties</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {selectedLayer.type === 'text'
                ? <Type size={14} className="text-brand-300" />
                : <ImageIcon size={14} className="text-cyan-400" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{selectedLayer.name}</p>
                <p className="text-[10px] text-white/30 capitalize">{selectedLayer.type} layer</p>
              </div>
              <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase',
                selectedLayer.type === 'text'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')}>
                {selectedLayer.type}
              </span>
            </div>
            {selectedLayer.type === 'text' && (
              <TextControls layer={selectedLayer} onChange={onLayerChange} onReset={onResetLayer} />
            )}
            {selectedLayer.type === 'image' && (
              <ImageControls layer={selectedLayer} onChange={onLayerChange} onReset={onResetLayer} />
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {show && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="right-panel-mobile"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 bottom-0 z-30"
            >
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="right-panel"
          initial={{ x: 280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="flex-shrink-0"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Konva layer components ──────────────────────────────────────────────────────

function KonvaLayerImage({ layer, isSelected, onSelect, onDragEnd, onTransformEnd, transformerRef }) {
  const img = useKonvaImage(layer.dataUrl)
  const nodeRef = useRef(null)

  useEffect(() => {
    if (!transformerRef?.current) return
    if (isSelected && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current.nodes().includes(nodeRef.current)) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected, transformerRef])

  if (!img) return null
  return (
    <KonvaImage
      ref={nodeRef}
      image={img}
      x={layer.left}
      y={layer.top}
      width={layer.width}
      height={layer.height}
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      draggable
      onDragEnd={e => onDragEnd(layer.id, e.target.x(), e.target.y())}
      onTransformEnd={e => onTransformEnd(layer.id, e)}
    />
  )
}

function KonvaLayerText({ layer, isSelected, onSelect, onDragEnd, onTransformEnd, transformerRef }) {
  const nodeRef = useRef(null)

  useEffect(() => {
    if (!transformerRef?.current) return
    if (isSelected && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current.nodes().includes(nodeRef.current)) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected, transformerRef])

  const fontStyle = [layer.bold ? 'bold' : '', layer.italic ? 'italic' : ''].filter(Boolean).join(' ') || 'normal'

  return (
    <KonvaText
      ref={nodeRef}
      text={layer.textContent || ''}
      x={layer.left}
      y={layer.top}
      fontFamily={layer.fontFamily || 'Inter'}
      fontSize={layer.fontSize || 16}
      fill={layer.color || '#ffffff'}
      fontStyle={fontStyle}
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      draggable
      onDragEnd={e => onDragEnd(layer.id, e.target.x(), e.target.y())}
      onTransformEnd={e => onTransformEnd(layer.id, e)}
    />
  )
}

// ── Publish Modal ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'thumbnail',      label: 'Thumbnail' },
  { value: 'logo',           label: 'Logo' },
  { value: 'banner-shop',    label: 'Banner Shop' },
  { value: 'banner-youtube', label: 'Banner YouTube' },
  { value: 'banner-discord', label: 'Banner Discord' },
]

function PublishModal({ open, onClose, form, setForm, onSubmit, editableFieldCount }) {
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    color: 'rgba(255,255,255,0.85)',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    fontSize: 13,
  }
  const labelStyle = {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <Modal open={open} onClose={onClose} title="Đăng sản phẩm lên cửa hàng" size="md">
      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Title */}
        <div>
          <label style={labelStyle}>Tiêu đề *</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Tên sản phẩm..."
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Mô tả</label>
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            placeholder="Mô tả ngắn về sản phẩm..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Category */}
          <div>
            <label style={labelStyle}>Danh mục</label>
            <select
              style={inputStyle}
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Tag */}
          <div>
            <label style={labelStyle}>Tag ngắn (tối đa 12 ký tự)</label>
            <input
              style={inputStyle}
              value={form.tag}
              maxLength={12}
              onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              placeholder="e.g. Gaming"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Price */}
          <div>
            <label style={labelStyle}>Giá (coins)</label>
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            />
          </div>

          {/* Badge */}
          <div>
            <label style={labelStyle}>Badge</label>
            <select
              style={inputStyle}
              value={form.badge}
              onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
            >
              <option value="">Không có</option>
              <option value="NEW">NEW</option>
              <option value="HOT">HOT</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Discount code */}
          <div>
            <label style={labelStyle}>Mã giảm giá (tùy chọn)</label>
            <input
              style={inputStyle}
              value={form.discountCode}
              onChange={e => setForm(f => ({ ...f, discountCode: e.target.value }))}
              placeholder="e.g. SALE20"
            />
          </div>

          {/* Discount percent */}
          <div>
            <label style={labelStyle}>% Giảm (0–100)</label>
            <input
              style={inputStyle}
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))}
            />
          </div>
        </div>

        {editableFieldCount === 0 && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: 'rgba(253,224,71,0.9)' }}>
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>Không tìm thấy layer chuẩn. Sản phẩm sẽ đăng không có trường chỉnh sửa. Đặt tên layer đúng quy chuẩn: <code className="bg-black/30 px-1 rounded text-[10px]">text_1, avt_png, logo...</code></span>
          </div>
        )}
        {/* Extra images for slideshow */}
        <div>
          <label style={labelStyle}>Ảnh bổ sung (slideshow) — tùy chọn</label>
          <div className="space-y-2">
            {form.extraImages?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.extraImages.map((img, i) => (
                  <div key={i} className="relative group/img">
                    <img src={img} alt={`extra-${i}`} className="w-16 h-12 object-cover rounded-lg"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, extraImages: f.extraImages.filter((_, j) => j !== i) }))}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center"
                      style={{ fontSize: 9 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs"
              style={{ background: 'rgba(110,75,255,0.1)', border: '1px dashed rgba(110,75,255,0.35)', color: 'rgba(167,139,250,0.9)' }}>
              <ImagePlus size={13} /> Thêm ảnh preview bổ sung
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files)
                  Promise.all(files.map(f => new Promise(resolve => {
                    const reader = new FileReader()
                    reader.onload = ev => resolve(ev.target.result)
                    reader.readAsDataURL(f)
                  }))).then(newImgs => {
                    setForm(prev => ({ ...prev, extraImages: [...(prev.extraImages || []), ...newImgs] }))
                  })
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)' }}>
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.title.trim()}
            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Store size={14} /> Đăng lên cửa hàng
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Toolbar ─────────────────────────────────────────────────────────────────────

function Toolbar({
  psdFile, psdMeta, zoom, onZoomIn, onZoomOut, onZoomFit,
  showLeft, showRight, onToggleLeft, onToggleRight,
  userBalance, onExportClick, isLg, hasPaid, isAdmin, onPublishClick
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
      style={{
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {!isLg && (
        <>
          <button onClick={onToggleLeft}
            className={clsx('p-1.5 rounded-lg transition-colors',
              showLeft ? 'text-brand-300 bg-brand-500/20' : 'text-white/40 hover:text-white hover:bg-white/[0.06]')}>
            <PanelLeft size={15} />
          </button>
          <button onClick={onToggleRight}
            className={clsx('p-1.5 rounded-lg transition-colors',
              showRight ? 'text-brand-300 bg-brand-500/20' : 'text-white/40 hover:text-white hover:bg-white/[0.06]')}>
            <PanelRight size={15} />
          </button>
          <div className="w-px h-4 bg-white/10" />
        </>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(110,75,255,0.2)' }}>
          <Layers size={12} className="text-brand-300" />
        </div>
        <span className="text-xs font-medium text-white/70 truncate max-w-[120px]">
          {psdFile ? psdFile.name : 'No file'}
        </span>
        {psdMeta && (
          <span className="text-[10px] text-white/30 flex-shrink-0">
            {psdMeta.width} x {psdMeta.height}px
          </span>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs text-white/40 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
          <ZoomIn size={14} />
        </button>
        <button onClick={onZoomFit} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
          <Maximize2 size={14} />
        </button>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Star size={11} className="text-yellow-400" />
          <span className="text-xs text-white/70 font-medium">{userBalance ?? 0}</span>
        </div>
        {!psdMeta ? (
          <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold opacity-40 cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Lock size={12} /> Export
          </button>
        ) : hasPaid ? (
          <button onClick={onExportClick}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Download size={12} /> Export
          </button>
        ) : (
          <button onClick={onExportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            style={{ background: 'rgba(110,75,255,0.15)', border: '1px solid rgba(110,75,255,0.3)', color: 'rgba(167,139,250,1)' }}
            title="Thanh toán 50 coins để xuất ảnh chất lượng cao không watermark"
          >
            <Lock size={12} /> Export <span className="text-[10px] opacity-70">50 ⭐</span>
          </button>
        )}
        {isAdmin && psdMeta && (
          <>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={onPublishClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(43,242,192,0.12)', border: '1px solid rgba(43,242,192,0.3)', color: 'rgba(43,242,192,1)' }}
            >
              <Store size={12} /> Đăng lên cửa hàng
            </button>
          </>
        )}
      </div>
    </div>
  )
}


// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PsdEditorPage() {
  const { user, deductBalance } = useAuthStore()
  const isAdmin = useAuthStore(s => s.isAdmin())
  const { toast } = useAppStore()
  const addProduct = useShopStore(s => s.addProduct)

  // PSD state
  const [psdFile, setPsdFile] = useState(null)
  const [psdMeta, setPsdMeta] = useState(null) // { width, height }
  const [layers, setLayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [dragging, setDragging] = useState(false)

  // Editor state
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [fitZoom, setFitZoom] = useState(1)

  // Publish state
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishForm, setPublishForm] = useState({
    title: '', desc: '', category: 'thumbnail', tag: '',
    price: 0, badge: '', discountCode: '', discountPercent: 0, extraImages: [],
  })

  // Payment / export state
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('png')
  const [exportQuality, setExportQuality] = useState(0.95)
  // watermark visibility is controlled imperatively via watermarkRef (see handleExport)

  // Panel visibility
  const [isLg, setIsLg] = useState(window.innerWidth >= 1024)
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)

  // Refs
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const fileInputRef = useRef(null)
  const watermarkRef = useRef(null)

  // Responsive detection
  useEffect(() => {
    const onResize = () => {
      const lg = window.innerWidth >= 1024
      setIsLg(lg)
      if (!lg) { setShowLeft(false); setShowRight(false) }
      else { setShowLeft(true); setShowRight(true) }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Compute fit zoom when container or PSD size changes
  useEffect(() => {
    if (!containerRef.current || !psdMeta) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = (rect.width - 40) / psdMeta.width
    const scaleY = (rect.height - 40) / psdMeta.height
    const newFit = Math.min(scaleX, scaleY, 1)
    setFitZoom(newFit)
    setZoom(newFit)
  }, [psdMeta, showLeft, showRight])

  // ── PSD parsing ──────────────────────────────────────────────────────────────

  const parsePsd = useCallback(async (file) => {
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast('File too large. Maximum 50MB.', 'error', 'Error')
      return
    }
    setPsdFile(file)
    setLoading(true)
    setLoadingMsg('Reading file...')
    setLayers([])
    setPsdMeta(null)
    setSelectedLayerId(null)
    setHasPaid(false)

    try {
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })

      setLoadingMsg('Parsing PSD...')
      const psd = Psd.parse(arrayBuffer)
      setPsdMeta({ width: psd.width, height: psd.height })

      // Collect leaf layers
      const allLayers = []
      function collectLayers(nodes) {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            collectLayers(node.children)
          } else {
            allLayers.push(node)
          }
        }
      }
      collectLayers(psd.children || [])

      const total = allLayers.length
      const result = []

      for (let i = 0; i < allLayers.length; i++) {
        const node = allLayers[i]
        if (!node.width || !node.height) continue

        setLoadingMsg(`Processing layer ${i + 1}/${total}: ${node.name || 'Unnamed'}`)

        const isText = node.text != null && node.text !== ''
        let dataUrl = null
        let originalDataUrl = null

        if (!isText) {
          try {
            const composite = await node.composite()
            const rgba = composite instanceof Promise ? await composite : composite
            dataUrl = await rgbaToDataUrl(rgba, node.width, node.height)
            originalDataUrl = dataUrl
          } catch {
            // skip composite errors
          }
        }

        const entry = {
          id: uid(),
          name: node.name || `Layer ${i + 1}`,
          type: isText ? 'text' : 'image',
          visible: !node.isHidden,
          left: node.left || 0,
          top: node.top || 0,
          width: node.width,
          height: node.height,
          // text props
          textContent: isText ? (typeof node.text === 'string' ? node.text : (node.text?.content ?? '')) : undefined,
          originalTextContent: isText ? (typeof node.text === 'string' ? node.text : (node.text?.content ?? '')) : undefined,
          // TODO: font extraction requires walking EngineDict.StyleRun.RunArray[0].RunData.Font.Name (non-trivial in v0.4.x)
          fontFamily: isText ? (node.textProperties?.EngineDict?.StyleRun?.RunArray?.[0]?.RunData?.Font?.Name || 'Inter') : undefined,
          fontSize: isText ? (node.textProperties?.EngineDict?.StyleRun?.RunArray?.[0]?.RunData?.Font?.Size || 16) : undefined,
          color: '#ffffff', // TODO: parse from node.textProperties EngineData (non-trivial in v0.4.x)
          bold: false,
          italic: false,
          // image props
          dataUrl: !isText ? dataUrl : undefined,
          originalDataUrl: !isText ? originalDataUrl : undefined,
        }
        result.push(entry)
      }

      setLayers(result)
      setLoadingMsg('')
      toast(`Loaded ${result.length} layers`, 'success', psd.width + ' x ' + psd.height)
    } catch (err) {
      console.error(err)
      toast('Failed to parse PSD file', 'error', 'Error')
      setPsdFile(null)
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }, [toast])

  const handleFile = useCallback((f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.psd')) {
      toast('Only .psd files are supported', 'error', 'Invalid file')
      return
    }
    parsePsd(f)
  }, [parsePsd, toast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  // ── Layer operations ─────────────────────────────────────────────────────────

  const toggleLayerVisible = useCallback((id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }, [])

  const selectLayer = useCallback((id) => {
    setSelectedLayerId(prev => prev === id ? null : id)
  }, [])

  const updateLayer = useCallback((changes) => {
    setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, ...changes } : l))
  }, [selectedLayerId])

  const resetLayer = useCallback(() => {
    setLayers(prev => prev.map(l => {
      if (l.id !== selectedLayerId) return l
      if (l.type === 'text') return { ...l, textContent: l.originalTextContent }
      if (l.type === 'image') return { ...l, dataUrl: l.originalDataUrl }
      return l
    }))
  }, [selectedLayerId])

  const handleLayerDragEnd = useCallback((id, x, y) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, left: x, top: y } : l))
  }, [])

  const handleLayerTransformEnd = useCallback((id, e) => {
    const node = e.target
    setLayers(prev => prev.map(l => l.id === id ? {
      ...l,
      left: node.x(),
      top: node.y(),
      width: Math.max(5, node.width() * node.scaleX()),
      height: Math.max(5, node.height() * node.scaleY()),
    } : l))
    e.target.scaleX(1)
    e.target.scaleY(1)
  }, [])

  // ── Zoom controls ────────────────────────────────────────────────────────────

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 4))
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.05))
  const handleZoomFit = () => setZoom(fitZoom)

  const handlePublish = () => {
    if (!stageRef.current || !psdMeta) return
    const previewDataUrl = stageRef.current.toDataURL({ pixelRatio: 1 })
    const ratio = detectRatio(psdMeta.width, psdMeta.height)
    // Extract editable fields from named layers
    const editableFields = layers
      .map(l => {
        const role = detectLayerRole(l.name)
        if (!role) return null
        return {
          role: role.role,
          label: role.label,
          type: role.type,
          shape: role.shape || 'rect',
          defaultValue: l.type === 'text' ? (l.textContent || '') : null,
          x: l.left,
          y: l.top,
          width: l.width,
          height: l.height,
          fontSize: l.fontSize || 16,
          fontFamily: l.fontFamily || 'Inter',
          color: l.color || '#ffffff',
          bold: l.bold || false,
          italic: l.italic || false,
        }
      })
      .filter(Boolean)
    if (editableFields.length === 0) {
      // No named layers found - product will be published without editable fields
      // Admin should name layers: text_1, text_2, text_3, title_logo, text_logo, nvat_png, avt_png, logo
      console.warn('[Nova] No named layers found - product published without editable fields. Layer naming convention: text_1, text_2, text_3, title_logo, text_logo, nvat_png, avt_png, logo')
    }
    const totalImgSize = [previewDataUrl, ...(publishForm.extraImages || [])].reduce((acc, img) => acc + (img?.length || 0) * 0.75, 0)
    if (totalImgSize > 2 * 1024 * 1024) {
      toast('Tổng dung lượng ảnh quá lớn (>2MB). Vui lòng giảm ảnh bổ sung.', 'error', 'Quá dung lượng')
      return
    }
    addProduct({
      ...publishForm,
      previewDataUrl,
      ratio,
      width: psdMeta.width,
      height: psdMeta.height,
      psdFileName: psdFile?.name || '',
      sold: 0,
      createdAt: new Date().toISOString(),
      editableFields,
      images: [previewDataUrl, ...(publishForm.extraImages || [])],
    })
    toast('Đã đăng sản phẩm lên cửa hàng!', 'success', 'Publish')
    setShowPublishModal(false)
    setPublishForm({ title: '', desc: '', category: 'thumbnail', tag: '', price: 0, badge: '', discountCode: '', discountPercent: 0, extraImages: [] })
  }

  const handlePayment = () => {
    if (!user) {
      toast('Vui lòng đăng nhập để thanh toán', 'error', 'Chưa đăng nhập')
      return
    }
    // Admin sử dụng miễn phí
    if (user.email === 'finnlive246@gmail.com') {
      setHasPaid(true)
      setShowPaymentModal(false)
      toast('Admin: xuất ảnh miễn phí!', 'success', 'Admin')
      setShowExportModal(true)
      return
    }
    const success = deductBalance(50)
    if (!success) {
      toast('Số dư không đủ! Hãy nạp thêm coins.', 'error', 'Thanh toán thất bại')
      return
    }
    setHasPaid(true)
    setShowPaymentModal(false)
    toast('Thanh toán thành công! Bạn có thể xuất ảnh.', 'success', 'Đã thanh toán')
    setShowExportModal(true)
  }

  const handleExport = async () => {
    if (!stageRef.current || !psdMeta) return
    try {
      // Hide watermark directly via Konva node (bypasses React render cycle)
      if (watermarkRef.current) {
        watermarkRef.current.hide()
        stageRef.current.batchDraw()
      }
      const dataUrl = stageRef.current.toDataURL({
        mimeType: exportFormat === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: exportQuality,
        pixelRatio: 2,
      })
      // Restore watermark
      if (watermarkRef.current) {
        watermarkRef.current.show()
        stageRef.current.batchDraw()
      }
      // Trigger download
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `nova-psd-export-${Date.now()}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setShowExportModal(false)
      toast('Xuất ảnh thành công!', 'success', 'Export')
    } catch (err) {
      if (watermarkRef.current) {
        watermarkRef.current.show()
        stageRef.current?.batchDraw()
      }
      toast('Lỗi khi xuất ảnh. Vui lòng thử lại.', 'error', 'Export lỗi')
    }
  }

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Lock size={32} className="text-rose-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Chỉ dành cho Admin</h2>
          <p className="text-sm text-white/40">Bạn không có quyền truy cập trang này.</p>
        </div>
        <Link to="/" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
          <ChevronLeft size={16} /> Quay lại trang chủ
        </Link>
      </div>
    )
  }

  const stageWidth = psdMeta ? psdMeta.width * zoom : 0
  const stageHeight = psdMeta ? psdMeta.height * zoom : 0

  const watermarkFontSize = psdMeta
    ? Math.max(20, Math.min(psdMeta.width, psdMeta.height) * 0.08)
    : 60

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      {/* Toolbar */}
      <Toolbar
        psdFile={psdFile}
        psdMeta={psdMeta}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        showLeft={showLeft}
        showRight={showRight}
        onToggleLeft={() => setShowLeft(v => !v)}
        onToggleRight={() => setShowRight(v => !v)}
        userBalance={user?.balance}
        onExportClick={() => hasPaid ? setShowExportModal(true) : setShowPaymentModal(true)}
        isLg={isLg}
        hasPaid={hasPaid}
        isAdmin={isAdmin}
        onPublishClick={() => setShowPublishModal(true)}
      />

      {/* Export session active banner */}
      {hasPaid && psdMeta && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs"
          style={{ background: 'rgba(43,242,192,0.08)', borderBottom: '1px solid rgba(43,242,192,0.15)' }}>
          <Download size={12} className="text-teal-400" />
          <span className="text-teal-300">Export session active — do not navigate away.</span>
          <button onClick={() => setShowExportModal(true)} className="ml-auto text-teal-400 underline font-medium">
            Export now
          </button>
        </div>
      )}

      {/* Editor body */}
      <div className="flex flex-1 min-h-0 relative">

        {/* Left panel */}
        <LeftPanel
          show={showLeft}
          onClose={() => setShowLeft(false)}
          layers={layers}
          selectedId={selectedLayerId}
          onSelect={selectLayer}
          onToggleVisible={toggleLayerVisible}
          isMobile={!isLg}
        />

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="flex-1 min-w-0 flex items-center justify-center overflow-auto"
          style={{ background: '#0a0a10' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedLayerId(null) }}
        >
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-xs text-white/40">{loadingMsg}</p>
            </div>
          )}

          {!loading && !psdMeta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'relative rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 m-6',
                dragging
                  ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
                  : 'border-white/[0.1] hover:border-brand-400/50 hover:bg-white/[0.02]'
              )}
              style={{ minWidth: 380, minHeight: 280 }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  animate={dragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                  className={clsx(
                    'w-20 h-20 rounded-2xl mb-5 flex items-center justify-center border transition-all',
                    dragging
                      ? 'bg-brand-500/30 border-brand-400/50'
                      : 'bg-white/[0.04] border-white/[0.08]'
                  )}
                >
                  <Upload size={32} className={dragging ? 'text-brand-400' : 'text-white/30'} />
                </motion.div>
                <p className="text-lg font-semibold text-white/80 mb-2">
                  {dragging ? 'Drop your PSD here!' : 'Drop your PSD file here'}
                </p>
                <p className="text-sm text-white/40 mb-4">or click to browse</p>
                <p className="text-xs text-white/25">Only .psd files - max 50MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".psd"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
            </motion.div>
          )}

          {!loading && psdMeta && (
            <div style={{ width: stageWidth, height: stageHeight, flexShrink: 0 }}>
              <Stage
                ref={stageRef}
                width={stageWidth}
                height={stageHeight}
                scaleX={zoom}
                scaleY={zoom}
              >
                <Layer>
                  {layers.filter(l => l.visible).map(layer => {
                    const isSelected = layer.id === selectedLayerId
                    if (layer.type === 'image') {
                      return (
                        <KonvaLayerImage
                          key={layer.id}
                          layer={layer}
                          isSelected={isSelected}
                          onSelect={selectLayer}
                          onDragEnd={handleLayerDragEnd}
                          onTransformEnd={handleLayerTransformEnd}
                          transformerRef={isSelected ? transformerRef : null}
                        />
                      )
                    }
                    if (layer.type === 'text') {
                      return (
                        <KonvaLayerText
                          key={layer.id}
                          layer={layer}
                          isSelected={isSelected}
                          onSelect={selectLayer}
                          onDragEnd={handleLayerDragEnd}
                          onTransformEnd={handleLayerTransformEnd}
                          transformerRef={isSelected ? transformerRef : null}
                        />
                      )
                    }
                    return null
                  })}

                  {/* Watermark */}
                  <KonvaText
                    ref={watermarkRef}
                    text="NOVA AI STUDIO"
                    x={psdMeta.width / 2}
                    y={psdMeta.height / 2}
                    rotation={-35}
                    opacity={0.25}
                    fill="rgba(255,255,255,0.5)"
                    fontSize={watermarkFontSize}
                    fontStyle="bold"
                    offsetX={watermarkFontSize * 4}
                    offsetY={watermarkFontSize / 2}
                    listening={false}
                  />

                  <Transformer ref={transformerRef} />
                </Layer>
              </Stage>
            </div>
          )}
        </div>

        {/* Right panel */}
        <RightPanel
          show={showRight}
          onClose={() => setShowRight(false)}
          selectedLayer={selectedLayer}
          onLayerChange={updateLayer}
          onResetLayer={resetLayer}
          isMobile={!isLg}
        />
      </div>

      {/* Payment Modal */}
      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Xuất ảnh chất lượng cao" size="sm">
        <div className="p-6 space-y-5">
          {/* Description */}
          <div className="flex gap-3 p-4 rounded-2xl" style={{ background: 'rgba(110,75,255,0.1)', border: '1px solid rgba(110,75,255,0.2)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(110,75,255,0.2)' }}>
              <Download size={18} className="text-brand-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Export không watermark</p>
              <p className="text-xs text-white/50 leading-relaxed">Tải xuống ảnh PNG/JPG chất lượng cao, không có watermark "NOVA AI STUDIO".</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p className="text-xs text-white/40 mb-1">Giá xuất ảnh</p>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <span className="text-xl font-bold text-white font-display">50 coins</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 mb-1">Số dư của bạn</p>
              <div className="flex items-center gap-1 justify-end">
                <Star size={13} className="text-yellow-400" />
                <span className={clsx('text-base font-bold font-display', (user?.balance ?? 0) >= 50 ? 'text-emerald-400' : 'text-rose-400')}>
                  {user?.balance ?? 0} coins
                </span>
              </div>
            </div>
          </div>

          {/* Insufficient balance warning */}
          {(user?.balance ?? 0) < 50 && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(252,165,165,1)' }}>
              <span>Số dư không đủ.</span>
              <Link to="/topup" onClick={() => setShowPaymentModal(false)} className="underline font-semibold hover:text-rose-300">Nạp thêm coins →</Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setShowPaymentModal(false)} className="btn-ghost flex-1 py-2.5 text-sm">Hủy</button>
            <button
              onClick={handlePayment}
              disabled={(user?.balance ?? 0) < 50}
              className={clsx('btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2',
                (user?.balance ?? 0) < 50 && 'opacity-50 cursor-not-allowed')}
            >
              <Star size={14} /> Thanh toán 50 coins
            </button>
          </div>
        </div>
      </Modal>

      {/* Publish Modal */}
      <PublishModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        form={publishForm}
        setForm={setPublishForm}
        onSubmit={handlePublish}
        editableFieldCount={layers.filter(l => !!detectLayerRole(l.name)).length}
      />

      {/* Export Format Modal */}
      <Modal open={showExportModal} onClose={() => setShowExportModal(false)} title="Chọn định dạng xuất" size="sm">
        <div className="p-6 space-y-5">
          {/* Format selection */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { format: 'png', label: 'PNG', desc: 'Lossless, hỗ trợ trong suốt', icon: '🖼️' },
              { format: 'jpg', label: 'JPG', desc: 'File nhỏ hơn, chất lượng cao', icon: '📷' },
            ].map(({ format, label, desc, icon }) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={clsx(
                  'p-4 rounded-2xl text-left transition-all',
                  exportFormat === format
                    ? 'border-brand-500/50 bg-brand-500/15'
                    : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'
                )}
                style={{ border: exportFormat === format ? '1px solid rgba(110,75,255,0.5)' : '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{desc}</p>
                {exportFormat === format && (
                  <div className="mt-2 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(110,75,255,0.8)' }}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quality slider - only for JPG */}
          {exportFormat === 'jpg' && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-white/40 uppercase tracking-wider">Chất lượng</label>
                <span className="text-xs font-semibold text-white">{Math.round(exportQuality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.7}
                max={1}
                step={0.05}
                value={exportQuality}
                onChange={e => setExportQuality(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex items-center gap-2 text-xs text-white/30 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.025)' }}>
            <Download size={12} className="flex-shrink-0" />
            <span>Xuất ảnh 2x (Retina) không watermark. Kích thước: {psdMeta?.width ?? 0} x {psdMeta?.height ?? 0}px</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setShowExportModal(false)} className="btn-ghost flex-1 py-2.5 text-sm">Hủy</button>
            <button onClick={handleExport} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
              <Download size={14} /> Xuất ngay
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
