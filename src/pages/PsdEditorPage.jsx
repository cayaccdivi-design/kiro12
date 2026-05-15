import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stage, Layer, Image as KonvaImage, Text as KonvaText,
  Rect as KonvaRect, Circle as KonvaCircle, Transformer
} from 'react-konva'
import Psd from '@webtoon/psd'
import {
  Upload, Eye, EyeOff, Type, Image as ImageIcon, Layers,
  ZoomIn, ZoomOut, Maximize2, Lock, Star, ChevronLeft,
  ChevronRight, RotateCcw, Bold, Italic, X, Loader,
  PanelLeft, PanelRight, Download, Store, ImagePlus,
  Undo2, Redo2, Plus, Copy, Trash2, LockKeyhole, Unlock,
  ChevronsUp, ChevronsDown, ArrowUp, ArrowDown,
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  Square, Circle as CircleIcon, Sparkles, Wand2, Palette,
  RotateCw, Sliders, Underline as UnderlineIcon
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

// ── Layer defaults & factories ────────────────────────────────────────────────

function withDefaults(layer) {
  // Provides default values for advanced fields so older layers still work
  return {
    rotation: 0,
    opacity: 1,
    locked: false,
    // image filters (only applied when type === 'image')
    brightness: 0,        // -1 .. 1   (Konva range: -1..1)
    contrast: 0,          // -100 .. 100
    saturation: 0,        // -2 .. 10  (we use -2..2)
    blur: 0,              // 0 .. 40
    grayscale: false,
    invert: false,
    // text advanced fields
    align: 'left',        // left | center | right
    letterSpacing: 0,
    lineHeight: 1.2,
    underline: false,
    strokeColor: '#000000',
    strokeWidth: 0,
    shadowColor: '#000000',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowOpacity: 0.5,
    // shape fields
    fill: layer.type === 'shape' ? '#6e4bff' : undefined,
    shape: layer.type === 'shape' ? (layer.shape || 'rect') : undefined,
    cornerRadius: 0,
    ...layer,
  }
}

function makeTextLayer({ left = 50, top = 50 } = {}) {
  return withDefaults({
    id: uid(),
    name: 'New Text',
    type: 'text',
    visible: true,
    left, top,
    width: 320,
    height: 60,
    textContent: 'Your text here',
    originalTextContent: 'Your text here',
    fontFamily: 'Inter',
    fontSize: 48,
    color: '#ffffff',
    bold: true,
    italic: false,
  })
}

function makeShapeLayer({ shape = 'rect', left = 80, top = 80 } = {}) {
  return withDefaults({
    id: uid(),
    name: shape === 'circle' ? 'Circle' : 'Rectangle',
    type: 'shape',
    shape,
    visible: true,
    left, top,
    width: 200,
    height: shape === 'circle' ? 200 : 140,
    fill: '#6e4bff',
    cornerRadius: shape === 'rect' ? 12 : 0,
  })
}

function makeImageLayer({ dataUrl, width, height, left = 60, top = 60, name = 'Image' }) {
  const W = width || 400
  const H = height || 300
  return withDefaults({
    id: uid(),
    name,
    type: 'image',
    visible: true,
    left, top,
    width: W,
    height: H,
    dataUrl,
    originalDataUrl: dataUrl,
  })
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
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
  const TypeIcon = layer.type === 'text'
    ? Type
    : layer.type === 'shape'
      ? (layer.shape === 'circle' ? CircleIcon : Square)
      : ImageIcon
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
      <TypeIcon size={13} className={clsx('flex-shrink-0',
        selected ? 'text-brand-300'
        : layer.type === 'shape' ? 'text-amber-300/70'
        : 'text-white/40')} />
      {layer.type === 'image' && layer.dataUrl && (
        <img
          src={layer.dataUrl}
          alt=""
          className="w-8 h-8 object-cover rounded flex-shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
      )}
      {layer.type === 'shape' && (
        <div
          className="w-8 h-8 rounded flex-shrink-0"
          style={{
            background: layer.fill || '#6e4bff',
            borderRadius: layer.shape === 'circle' ? '50%' : 6,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      )}
      <span className="truncate flex-1 text-xs">{layer.name}</span>
      {layer.locked && (
        <LockKeyhole size={11} className="flex-shrink-0 text-amber-400/70" />
      )}
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

// Reusable labeled slider used across all editing panels.
function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '', precision = 0 }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[11px] text-white/40 uppercase tracking-wider">{label}</label>
        <span className="text-[11px] text-white/60 font-mono">
          {Number(value || 0).toFixed(precision)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-brand-500"
      />
    </div>
  )
}

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-1.5 mb-2 mt-1">
    {Icon && <Icon size={11} className="text-white/40" />}
    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{title}</span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
)

function TextControls({ layer, onChange, onReset }) {
  return (
    <div className="space-y-3">
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
              title="Bold"
            >B</button>
            <button
              onClick={() => onChange({ italic: !layer.italic })}
              className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-sm italic transition-all',
                layer.italic ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
              title="Italic"
            >I</button>
            <button
              onClick={() => onChange({ underline: !layer.underline })}
              className={clsx('w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                layer.underline ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
              title="Underline"
            ><UnderlineIcon size={13} /></button>
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Align</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { v: 'left',   I: AlignLeft },
            { v: 'center', I: AlignCenter },
            { v: 'right',  I: AlignRight },
          ].map(({ v, I }) => (
            <button
              key={v}
              onClick={() => onChange({ align: v })}
              className={clsx('h-9 rounded-xl flex items-center justify-center transition-all',
                (layer.align || 'left') === v ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
            ><I size={13} /></button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <SectionHeader icon={Sliders} title="Spacing" />
      <Slider label="Letter Spacing" value={layer.letterSpacing || 0} onChange={v => onChange({ letterSpacing: v })} min={-10} max={50} />
      <Slider label="Line Height" value={layer.lineHeight || 1.2} onChange={v => onChange({ lineHeight: v })} min={0.5} max={3} step={0.05} precision={2} />

      {/* Stroke */}
      <SectionHeader icon={Palette} title="Stroke" />
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={layer.strokeColor || '#000000'}
          onChange={e => onChange({ strokeColor: e.target.value })}
          className="w-12 h-9 rounded-xl cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1">
          <Slider label="Width" value={layer.strokeWidth || 0} onChange={v => onChange({ strokeWidth: v })} min={0} max={20} step={0.5} precision={1} suffix="px" />
        </div>
      </div>

      {/* Shadow */}
      <SectionHeader icon={Sparkles} title="Shadow" />
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={layer.shadowColor || '#000000'}
          onChange={e => onChange({ shadowColor: e.target.value })}
          className="w-12 h-9 rounded-xl cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1">
          <Slider label="Blur" value={layer.shadowBlur || 0} onChange={v => onChange({ shadowBlur: v })} min={0} max={50} suffix="px" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Slider label="Offset X" value={layer.shadowOffsetX || 0} onChange={v => onChange({ shadowOffsetX: v })} min={-30} max={30} suffix="px" />
        <Slider label="Offset Y" value={layer.shadowOffsetY || 0} onChange={v => onChange({ shadowOffsetY: v })} min={-30} max={30} suffix="px" />
      </div>
      <Slider label="Shadow Opacity" value={layer.shadowOpacity ?? 0.5} onChange={v => onChange({ shadowOpacity: v })} min={0} max={1} step={0.05} precision={2} />

      <button onClick={onReset} className="btn-ghost w-full flex items-center justify-center gap-2 text-xs py-2 mt-2">
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
    <div className="space-y-3">
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
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleReplace} />
      </button>

      {/* Filters */}
      <SectionHeader icon={Wand2} title="Adjust" />
      <Slider label="Brightness" value={layer.brightness || 0} onChange={v => onChange({ brightness: v })} min={-1} max={1} step={0.02} precision={2} />
      <Slider label="Contrast"   value={layer.contrast || 0}   onChange={v => onChange({ contrast: v })}   min={-100} max={100} />
      <Slider label="Saturation" value={layer.saturation || 0} onChange={v => onChange({ saturation: v })} min={-2} max={2} step={0.05} precision={2} />
      <Slider label="Blur"       value={layer.blur || 0}       onChange={v => onChange({ blur: v })}       min={0} max={40} suffix="px" />

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange({ grayscale: !layer.grayscale })}
          className={clsx('py-2 rounded-xl text-[11px] font-medium transition-all',
            layer.grayscale ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
        >Grayscale</button>
        <button
          onClick={() => onChange({ invert: !layer.invert })}
          className={clsx('py-2 rounded-xl text-[11px] font-medium transition-all',
            layer.invert ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'btn-ghost')}
        >Invert</button>
      </div>
      <button
        onClick={() => onChange({ brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false, invert: false })}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-[11px] py-1.5"
      >
        <RotateCcw size={11} /> Reset filters
      </button>

      <button onClick={onReset} className="btn-ghost w-full flex items-center justify-center gap-2 text-xs py-2 mt-1">
        <RotateCcw size={12} /> Reset to original
      </button>
    </div>
  )
}

function ShapeControls({ layer, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5 block">Fill Color</label>
        <input
          type="color"
          value={layer.fill || '#6e4bff'}
          onChange={e => onChange({ fill: e.target.value })}
          className="w-full h-9 rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>
      {layer.shape === 'rect' && (
        <Slider label="Corner Radius" value={layer.cornerRadius || 0} onChange={v => onChange({ cornerRadius: v })} min={0} max={200} suffix="px" />
      )}
      <SectionHeader icon={Palette} title="Stroke" />
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={layer.strokeColor || '#000000'}
          onChange={e => onChange({ strokeColor: e.target.value })}
          className="w-12 h-9 rounded-xl cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1">
          <Slider label="Width" value={layer.strokeWidth || 0} onChange={v => onChange({ strokeWidth: v })} min={0} max={30} step={0.5} precision={1} suffix="px" />
        </div>
      </div>
      <SectionHeader icon={Sparkles} title="Shadow" />
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={layer.shadowColor || '#000000'}
          onChange={e => onChange({ shadowColor: e.target.value })}
          className="w-12 h-9 rounded-xl cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex-1">
          <Slider label="Blur" value={layer.shadowBlur || 0} onChange={v => onChange({ shadowBlur: v })} min={0} max={60} suffix="px" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Slider label="Offset X" value={layer.shadowOffsetX || 0} onChange={v => onChange({ shadowOffsetX: v })} min={-40} max={40} suffix="px" />
        <Slider label="Offset Y" value={layer.shadowOffsetY || 0} onChange={v => onChange({ shadowOffsetY: v })} min={-40} max={40} suffix="px" />
      </div>
    </div>
  )
}

function TransformControls({ layer, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">X</label>
          <input type="number" value={Math.round(layer.left)} onChange={e => onChange({ left: Number(e.target.value) })}
            className="input-glass text-xs py-1.5" />
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">Y</label>
          <input type="number" value={Math.round(layer.top)} onChange={e => onChange({ top: Number(e.target.value) })}
            className="input-glass text-xs py-1.5" />
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">W</label>
          <input type="number" value={Math.round(layer.width)} onChange={e => onChange({ width: Math.max(1, Number(e.target.value)) })}
            className="input-glass text-xs py-1.5" min={1} />
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider mb-1 block">H</label>
          <input type="number" value={Math.round(layer.height)} onChange={e => onChange({ height: Math.max(1, Number(e.target.value)) })}
            className="input-glass text-xs py-1.5" min={1} />
        </div>
      </div>
      <Slider label="Rotation" value={layer.rotation || 0} onChange={v => onChange({ rotation: v })} min={-180} max={180} suffix="°" />
      <Slider label="Opacity"  value={layer.opacity ?? 1}  onChange={v => onChange({ opacity: v })}  min={0} max={1} step={0.02} precision={2} />
    </div>
  )
}

function AlignmentControls({ onAlign }) {
  const buttons = [
    { k: 'l',  I: AlignStartVertical,    title: 'Align Left' },
    { k: 'cx', I: AlignCenterVertical,   title: 'Center Horizontally' },
    { k: 'r',  I: AlignEndVertical,      title: 'Align Right' },
    { k: 't',  I: AlignStartHorizontal,  title: 'Align Top' },
    { k: 'cy', I: AlignCenterHorizontal, title: 'Center Vertically' },
    { k: 'b',  I: AlignEndHorizontal,    title: 'Align Bottom' },
  ]
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {buttons.map(({ k, I, title }) => (
        <button
          key={k}
          onClick={() => onAlign(k)}
          title={title}
          className="btn-ghost h-9 rounded-xl flex items-center justify-center"
        >
          <I size={14} />
        </button>
      ))}
    </div>
  )
}

function OrderControls({ layer, onAction }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <button onClick={() => onAction('toFront')} title="Bring to Front" className="btn-ghost h-9 rounded-xl flex items-center justify-center"><ChevronsUp size={14} /></button>
        <button onClick={() => onAction('forward')} title="Bring Forward"  className="btn-ghost h-9 rounded-xl flex items-center justify-center"><ArrowUp size={14} /></button>
        <button onClick={() => onAction('backward')} title="Send Backward" className="btn-ghost h-9 rounded-xl flex items-center justify-center"><ArrowDown size={14} /></button>
        <button onClick={() => onAction('toBack')} title="Send to Back"    className="btn-ghost h-9 rounded-xl flex items-center justify-center"><ChevronsDown size={14} /></button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => onAction('duplicate')}
          className="btn-ghost h-9 rounded-xl flex items-center justify-center gap-1 text-[11px]"
          title="Duplicate (Ctrl+D)"
        ><Copy size={12} /> Copy</button>
        <button
          onClick={() => onAction('toggleLock')}
          className={clsx('h-9 rounded-xl flex items-center justify-center gap-1 text-[11px]',
            layer.locked
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'btn-ghost')}
          title="Lock / Unlock"
        >{layer.locked ? <LockKeyhole size={12} /> : <Unlock size={12} />} {layer.locked ? 'Locked' : 'Lock'}</button>
        <button
          onClick={() => onAction('delete')}
          className="h-9 rounded-xl flex items-center justify-center gap-1 text-[11px] transition-all"
          style={{ background: 'rgba(239,68,68,0.12)', color: 'rgba(252,165,165,1)', border: '1px solid rgba(239,68,68,0.25)' }}
          title="Delete (Del)"
        ><Trash2 size={12} /> Delete</button>
      </div>
    </div>
  )
}

function RightPanel({ show, onClose, selectedLayer, onLayerChange, onResetLayer, onLayerAction, onAlign, isMobile }) {
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
            <p className="text-[10px] text-white/20 mt-2 max-w-[180px] leading-relaxed">
              Pick a layer in the left panel or click directly on the canvas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Layer header */}
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {selectedLayer.type === 'text'
                ? <Type size={14} className="text-brand-300" />
                : selectedLayer.type === 'shape'
                  ? (selectedLayer.shape === 'circle'
                      ? <CircleIcon size={14} className="text-amber-300" />
                      : <Square size={14} className="text-amber-300" />)
                  : <ImageIcon size={14} className="text-cyan-400" />}
              <div className="flex-1 min-w-0">
                <input
                  value={selectedLayer.name}
                  onChange={e => onLayerChange({ name: e.target.value })}
                  className="w-full bg-transparent text-xs font-medium text-white truncate outline-none"
                />
                <p className="text-[10px] text-white/30 capitalize">{selectedLayer.type} layer</p>
              </div>
              <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase',
                selectedLayer.type === 'text'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : selectedLayer.type === 'shape'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')}>
                {selectedLayer.type}
              </span>
            </div>

            {/* Order / Action toolbar */}
            <div>
              <SectionHeader icon={Layers} title="Layer" />
              <OrderControls layer={selectedLayer} onAction={onLayerAction} />
            </div>

            {/* Transform */}
            <div>
              <SectionHeader icon={RotateCw} title="Transform" />
              <TransformControls layer={selectedLayer} onChange={onLayerChange} />
            </div>

            {/* Align to canvas */}
            <div>
              <SectionHeader icon={AlignCenter} title="Align to canvas" />
              <AlignmentControls onAlign={onAlign} />
            </div>

            {/* Type-specific controls */}
            {selectedLayer.type === 'text' && (
              <div>
                <SectionHeader icon={Type} title="Text" />
                <TextControls layer={selectedLayer} onChange={onLayerChange} onReset={onResetLayer} />
              </div>
            )}
            {selectedLayer.type === 'image' && (
              <div>
                <SectionHeader icon={ImageIcon} title="Image" />
                <ImageControls layer={selectedLayer} onChange={onLayerChange} onReset={onResetLayer} />
              </div>
            )}
            {selectedLayer.type === 'shape' && (
              <div>
                <SectionHeader icon={Square} title="Shape" />
                <ShapeControls layer={selectedLayer} onChange={onLayerChange} />
              </div>
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

  // Konva filters require node.cache(); re-cache when image / filter values change
  const filters = useMemo(() => {
    const Konva = window.Konva
    if (!Konva) return []
    const out = []
    if (layer.brightness) out.push(Konva.Filters.Brighten)
    if (layer.contrast)   out.push(Konva.Filters.Contrast)
    if (layer.saturation || layer.grayscale) out.push(Konva.Filters.HSL)
    if (layer.blur > 0)   out.push(Konva.Filters.Blur)
    if (layer.grayscale)  out.push(Konva.Filters.Grayscale)
    if (layer.invert)     out.push(Konva.Filters.Invert)
    return out
  }, [layer.brightness, layer.contrast, layer.saturation, layer.blur, layer.grayscale, layer.invert])

  useEffect(() => {
    const node = nodeRef.current
    if (!node || !img) return
    if (filters.length > 0) {
      try {
        node.cache()
      } catch { /* ignore cache errors */ }
    } else {
      try { node.clearCache() } catch {}
    }
    node.getLayer()?.batchDraw()
  }, [img, filters,
      layer.brightness, layer.contrast, layer.saturation,
      layer.blur, layer.grayscale, layer.invert,
      layer.width, layer.height])

  if (!img) return null
  return (
    <KonvaImage
      ref={nodeRef}
      image={img}
      x={layer.left}
      y={layer.top}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation || 0}
      opacity={layer.opacity ?? 1}
      filters={filters}
      brightness={layer.brightness || 0}
      contrast={layer.contrast || 0}
      saturation={layer.saturation || 0}
      blurRadius={layer.blur || 0}
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      draggable={!layer.locked}
      listening={!layer.locked}
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
  const textDecoration = layer.underline ? 'underline' : ''

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
      textDecoration={textDecoration}
      align={layer.align || 'left'}
      letterSpacing={layer.letterSpacing || 0}
      lineHeight={layer.lineHeight || 1.2}
      rotation={layer.rotation || 0}
      opacity={layer.opacity ?? 1}
      stroke={layer.strokeWidth > 0 ? layer.strokeColor : undefined}
      strokeWidth={layer.strokeWidth || 0}
      shadowColor={layer.shadowBlur > 0 || layer.shadowOffsetX || layer.shadowOffsetY ? layer.shadowColor : undefined}
      shadowBlur={layer.shadowBlur || 0}
      shadowOffsetX={layer.shadowOffsetX || 0}
      shadowOffsetY={layer.shadowOffsetY || 0}
      shadowOpacity={layer.shadowOpacity ?? 0.5}
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      draggable={!layer.locked}
      listening={!layer.locked}
      onDragEnd={e => onDragEnd(layer.id, e.target.x(), e.target.y())}
      onTransformEnd={e => onTransformEnd(layer.id, e)}
    />
  )
}

function KonvaLayerShape({ layer, isSelected, onSelect, onDragEnd, onTransformEnd, transformerRef }) {
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

  const common = {
    ref: nodeRef,
    x: layer.left,
    y: layer.top,
    rotation: layer.rotation || 0,
    opacity: layer.opacity ?? 1,
    fill: layer.fill || '#6e4bff',
    stroke: layer.strokeWidth > 0 ? layer.strokeColor : undefined,
    strokeWidth: layer.strokeWidth || 0,
    shadowColor: layer.shadowBlur > 0 ? layer.shadowColor : undefined,
    shadowBlur: layer.shadowBlur || 0,
    shadowOffsetX: layer.shadowOffsetX || 0,
    shadowOffsetY: layer.shadowOffsetY || 0,
    onClick: () => onSelect(layer.id),
    onTap: () => onSelect(layer.id),
    draggable: !layer.locked,
    listening: !layer.locked,
    onDragEnd: e => onDragEnd(layer.id, e.target.x(), e.target.y()),
    onTransformEnd: e => onTransformEnd(layer.id, e),
  }

  if (layer.shape === 'circle') {
    const r = Math.min(layer.width, layer.height) / 2
    return (
      <KonvaCircle
        {...common}
        x={layer.left + layer.width / 2}
        y={layer.top + layer.height / 2}
        radius={r}
      />
    )
  }
  return (
    <KonvaRect
      {...common}
      width={layer.width}
      height={layer.height}
      cornerRadius={layer.cornerRadius || 0}
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

function AddLayerMenu({ onAddText, onAddRect, onAddCircle, onAddImage, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const handleImagePick = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => onAddImage(ev.target.result, img.width, img.height, f.name)
      img.src = ev.target.result
    }
    reader.readAsDataURL(f)
    e.target.value = ''
    setOpen(false)
  }

  const item = (Icon, label, onClick) => (
    <button
      onClick={() => { onClick(); setOpen(false) }}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:bg-white/[0.06] transition-colors text-left"
    >
      <Icon size={13} className="text-brand-300" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="relative" ref={ref}>
      <button
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
          disabled
            ? 'opacity-40 cursor-not-allowed text-white/40'
            : 'text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]'
        )}
        title="Add new layer"
      >
        <Plus size={13} /> Add
      </button>
      {open && !disabled && (
        <div
          className="absolute left-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-30"
          style={{
            background: 'rgba(20,20,28,0.96)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {item(Type,        'Text',      onAddText)}
          {item(Square,      'Rectangle', onAddRect)}
          {item(CircleIcon,  'Circle',    onAddCircle)}
          {item(ImagePlus,   'Image...',  () => fileRef.current?.click())}
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleImagePick}
          />
        </div>
      )}
    </div>
  )
}

function Toolbar({
  psdFile, psdMeta, zoom, onZoomIn, onZoomOut, onZoomFit,
  showLeft, showRight, onToggleLeft, onToggleRight,
  userBalance, onExportClick, isLg, hasPaid, isAdmin, onPublishClick,
  canUndo, canRedo, onUndo, onRedo,
  onAddText, onAddRect, onAddCircle, onAddImage,
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

      {/* Undo / Redo / Add */}
      {psdMeta && (
        <>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={clsx('p-1.5 rounded-lg transition-colors',
                canUndo ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-white/20 cursor-not-allowed')}
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={clsx('p-1.5 rounded-lg transition-colors',
                canRedo ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-white/20 cursor-not-allowed')}
            >
              <Redo2 size={14} />
            </button>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <AddLayerMenu
            onAddText={onAddText}
            onAddRect={onAddRect}
            onAddCircle={onAddCircle}
            onAddImage={onAddImage}
          />
        </>
      )}

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
  const [layers, setLayersState] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [dragging, setDragging] = useState(false)

  // History (undo/redo) — only snapshot for "committed" actions
  const historyRef = useRef({ past: [], future: [] })
  const [historyVer, setHistoryVer] = useState(0)
  const HISTORY_LIMIT = 50

  // setLayers wrapper that records history snapshot of CURRENT layers before updating
  const setLayers = useCallback((updater, opts = {}) => {
    setLayersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!opts.noHistory && next !== prev) {
        const h = historyRef.current
        h.past.push(prev)
        if (h.past.length > HISTORY_LIMIT) h.past.shift()
        h.future = []
        setHistoryVer(v => v + 1)
      }
      return next
    })
  }, [])

  const undo = useCallback(() => {
    const h = historyRef.current
    if (h.past.length === 0) return
    setLayersState(prev => {
      h.future.push(prev)
      const next = h.past.pop()
      setHistoryVer(v => v + 1)
      return next
    })
  }, [])

  const redo = useCallback(() => {
    const h = historyRef.current
    if (h.future.length === 0) return
    setLayersState(prev => {
      h.past.push(prev)
      const next = h.future.pop()
      setHistoryVer(v => v + 1)
      return next
    })
  }, [])

  const canUndo = historyRef.current.past.length > 0
  const canRedo = historyRef.current.future.length > 0
  // historyVer is referenced to keep the canUndo/canRedo memoization fresh on re-renders
  void historyVer

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
    setLayersState([])
    historyRef.current = { past: [], future: [] }
    setHistoryVer(v => v + 1)
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

        const entry = withDefaults({
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
        })
        result.push(entry)
      }

      setLayersState(result)
      historyRef.current = { past: [], future: [] }
      setHistoryVer(v => v + 1)
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
  }, [setLayers])

  const selectLayer = useCallback((id) => {
    setSelectedLayerId(prev => prev === id ? null : id)
  }, [])

  const updateLayer = useCallback((changes) => {
    setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, ...changes } : l))
  }, [selectedLayerId, setLayers])

  const resetLayer = useCallback(() => {
    setLayers(prev => prev.map(l => {
      if (l.id !== selectedLayerId) return l
      if (l.type === 'text') return { ...l, textContent: l.originalTextContent }
      if (l.type === 'image') return { ...l, dataUrl: l.originalDataUrl }
      return l
    }))
  }, [selectedLayerId, setLayers])

  const handleLayerDragEnd = useCallback((id, x, y) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, left: x, top: y } : l))
  }, [setLayers])

  const handleLayerTransformEnd = useCallback((id, e) => {
    const node = e.target
    setLayers(prev => prev.map(l => l.id === id ? {
      ...l,
      left: node.x(),
      top: node.y(),
      width: Math.max(5, node.width() * node.scaleX()),
      height: Math.max(5, node.height() * node.scaleY()),
      rotation: node.rotation(),
    } : l))
    e.target.scaleX(1)
    e.target.scaleY(1)
  }, [setLayers])

  // ── Add / duplicate / delete / order / lock ──────────────────────────────────

  const addLayer = useCallback((newLayer) => {
    setLayers(prev => [...prev, newLayer])
    setSelectedLayerId(newLayer.id)
  }, [setLayers])

  const handleAddText = useCallback(() => {
    if (!psdMeta) return
    const cx = psdMeta.width / 2 - 160
    const cy = psdMeta.height / 2 - 30
    addLayer(makeTextLayer({ left: Math.max(0, cx), top: Math.max(0, cy) }))
  }, [psdMeta, addLayer])

  const handleAddRect = useCallback(() => {
    if (!psdMeta) return
    const cx = psdMeta.width / 2 - 100
    const cy = psdMeta.height / 2 - 70
    addLayer(makeShapeLayer({ shape: 'rect', left: Math.max(0, cx), top: Math.max(0, cy) }))
  }, [psdMeta, addLayer])

  const handleAddCircle = useCallback(() => {
    if (!psdMeta) return
    const cx = psdMeta.width / 2 - 100
    const cy = psdMeta.height / 2 - 100
    addLayer(makeShapeLayer({ shape: 'circle', left: Math.max(0, cx), top: Math.max(0, cy) }))
  }, [psdMeta, addLayer])

  const handleAddImage = useCallback((dataUrl, w, h, name) => {
    if (!psdMeta) return
    // Fit imported image to ~60% of the canvas width while keeping aspect ratio
    const maxW = psdMeta.width * 0.6
    const ratio = w / h
    let width = Math.min(w, maxW)
    let height = width / ratio
    if (height > psdMeta.height * 0.8) {
      height = psdMeta.height * 0.8
      width = height * ratio
    }
    const left = (psdMeta.width - width) / 2
    const top  = (psdMeta.height - height) / 2
    addLayer(makeImageLayer({ dataUrl, width, height, left, top, name: name || 'Image' }))
    toast('Image added', 'success', 'Layer')
  }, [psdMeta, addLayer, toast])

  const duplicateLayer = useCallback((id) => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id)
      if (idx === -1) return prev
      const src = prev[idx]
      const copy = { ...src, id: uid(), name: `${src.name} copy`, left: src.left + 20, top: src.top + 20, locked: false }
      const next = [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]
      // select the new copy on next tick
      setTimeout(() => setSelectedLayerId(copy.id), 0)
      return next
    })
  }, [setLayers])

  const deleteLayer = useCallback((id) => {
    setLayers(prev => prev.filter(l => l.id !== id))
    setSelectedLayerId(prev => prev === id ? null : prev)
  }, [setLayers])

  const toggleLock = useCallback((id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l))
  }, [setLayers])

  const reorderLayer = useCallback((id, action) => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id)
      if (idx === -1) return prev
      const arr = [...prev]
      const [item] = arr.splice(idx, 1)
      let target = idx
      if (action === 'toFront')  target = arr.length
      if (action === 'toBack')   target = 0
      if (action === 'forward')  target = Math.min(arr.length, idx + 1)
      if (action === 'backward') target = Math.max(0, idx - 1)
      arr.splice(target, 0, item)
      return arr
    })
  }, [setLayers])

  const handleLayerAction = useCallback((action) => {
    if (!selectedLayerId) return
    if (action === 'duplicate')  return duplicateLayer(selectedLayerId)
    if (action === 'delete')     return deleteLayer(selectedLayerId)
    if (action === 'toggleLock') return toggleLock(selectedLayerId)
    if (['toFront','toBack','forward','backward'].includes(action)) {
      return reorderLayer(selectedLayerId, action)
    }
  }, [selectedLayerId, duplicateLayer, deleteLayer, toggleLock, reorderLayer])

  const handleAlign = useCallback((dir) => {
    if (!selectedLayerId || !psdMeta) return
    setLayers(prev => prev.map(l => {
      if (l.id !== selectedLayerId) return l
      const W = psdMeta.width, H = psdMeta.height
      let { left, top, width, height } = l
      if (dir === 'l')  left = 0
      if (dir === 'cx') left = (W - width) / 2
      if (dir === 'r')  left = W - width
      if (dir === 't')  top = 0
      if (dir === 'cy') top = (H - height) / 2
      if (dir === 'b')  top = H - height
      return { ...l, left, top }
    }))
  }, [selectedLayerId, psdMeta, setLayers])

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

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!psdMeta) return

    const isTypingTarget = (el) => {
      if (!el) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
    }

    const onKey = (e) => {
      // Don't hijack typing in form fields
      if (isTypingTarget(e.target)) return

      const meta = e.ctrlKey || e.metaKey
      const k = e.key.toLowerCase()

      // Undo / Redo
      if (meta && k === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((meta && k === 'y') || (meta && k === 'z' && e.shiftKey)) {
        e.preventDefault()
        redo()
        return
      }

      if (!selectedLayerId) return

      // Duplicate
      if (meta && k === 'd') {
        e.preventDefault()
        duplicateLayer(selectedLayerId)
        return
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = layers.find(l => l.id === selectedLayerId)
        if (!sel || sel.locked) return
        e.preventDefault()
        deleteLayer(selectedLayerId)
        return
      }
      // Arrow nudge (Shift = 10x)
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const sel = layers.find(l => l.id === selectedLayerId)
        if (!sel || sel.locked) return
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        let dx = 0, dy = 0
        if (e.key === 'ArrowLeft')  dx = -step
        if (e.key === 'ArrowRight') dx =  step
        if (e.key === 'ArrowUp')    dy = -step
        if (e.key === 'ArrowDown')  dy =  step
        setLayers(prev => prev.map(l =>
          l.id === selectedLayerId ? { ...l, left: l.left + dx, top: l.top + dy } : l
        ))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [psdMeta, selectedLayerId, layers, undo, redo, duplicateLayer, deleteLayer, setLayers])

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
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onAddText={handleAddText}
        onAddRect={handleAddRect}
        onAddCircle={handleAddCircle}
        onAddImage={handleAddImage}
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
                    if (layer.type === 'shape') {
                      return (
                        <KonvaLayerShape
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
          onLayerAction={handleLayerAction}
          onAlign={handleAlign}
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
