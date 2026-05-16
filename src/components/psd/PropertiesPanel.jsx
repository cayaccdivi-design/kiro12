import { useRef } from 'react'
import {
  Type, Image as ImageIcon, RotateCcw, Lock,
  UploadCloud, Sparkles, Palette, Scissors, Box,
} from 'lucide-react'
import clsx from 'clsx'
import { isEditableTextLayer, editableTextHint } from '../../utils/layerNaming'
import { useFontStore } from '../../utils/fontManager'

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay',
  'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion',
]

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-white/30 mt-1">{hint}</p>}
    </div>
  )
}

function FontUploader() {
  const ref = useRef(null)
  const status = useFontStore(s => s.status)
  const error = useFontStore(s => s.error)
  const upload = useFontStore(s => s.uploadFont)
  return (
    <div>
      <button
        onClick={() => ref.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
        style={{
          background: 'rgba(110,75,255,0.12)',
          border: '1px dashed rgba(110,75,255,0.4)',
          color: 'rgba(196,181,253,1)',
        }}
      >
        <UploadCloud size={12} />
        {status === 'loading' ? 'Đang nạp font...' : 'Upload font (.ttf / .otf)'}
        <input
          ref={ref}
          type="file"
          accept=".ttf,.otf"
          className="hidden"
          onChange={async e => {
            const f = e.target.files?.[0]
            if (f) await upload(f)
            e.target.value = ''
          }}
        />
      </button>
      {error && <p className="text-[10px] text-rose-400 mt-1">{error}</p>}
    </div>
  )
}

function TextControls({ layer, onChange, onReset }) {
  const fonts = useFontStore(s => s.list())
  const editable = isEditableTextLayer(layer.name)

  if (!editable) {
    return (
      <div
        className="flex items-start gap-2 p-3 rounded-xl text-xs"
        style={{
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.25)',
          color: 'rgba(254,215,170,0.9)',
        }}
      >
        <Lock size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Text layer này không cho phép sửa.</p>
          <p className="text-white/40">
            Chỉ các layer có tên: <code className="px-1 py-0.5 rounded bg-black/40 text-amber-200">{editableTextHint()}</code> mới được mở khoá để sửa text.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Realtime text input */}
      <Field label="Nội dung (realtime)" hint="Mọi thay đổi áp dụng tức thì lên canvas.">
        <textarea
          value={layer.textContent || ''}
          onChange={e => onChange({ textContent: e.target.value, isEdited: true })}
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white',
            minHeight: 72,
          }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Font">
          <select
            value={layer.fontFamily || 'Inter'}
            onChange={e => onChange({ fontFamily: e.target.value, isEdited: true })}
            className="w-full text-xs py-1.5 px-2 rounded-lg outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          >
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Size">
          <input
            type="number"
            min={6}
            max={500}
            value={layer.fontSize || 16}
            onChange={e => onChange({ fontSize: Number(e.target.value), isEdited: true })}
            className="w-full text-xs py-1.5 px-2 rounded-lg outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
        </Field>
      </div>

      <FontUploader />

      <div className="flex items-end gap-2">
        <Field label="Color">
          <input
            type="color"
            value={layer.color || '#ffffff'}
            onChange={e => onChange({ color: e.target.value, isEdited: true })}
            className="w-12 h-9 rounded-lg cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </Field>
        <div className="flex gap-1.5">
          <button
            onClick={() => onChange({ bold: !layer.bold, isEdited: true })}
            className={clsx(
              'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
              layer.bold
                ? 'bg-violet-500/30 text-violet-200 ring-1 ring-violet-500/40'
                : 'bg-white/[0.04] text-white/60 hover:text-white'
            )}
          >B</button>
          <button
            onClick={() => onChange({ italic: !layer.italic, isEdited: true })}
            className={clsx(
              'w-9 h-9 rounded-lg flex items-center justify-center text-sm italic transition-all',
              layer.italic
                ? 'bg-violet-500/30 text-violet-200 ring-1 ring-violet-500/40'
                : 'bg-white/[0.04] text-white/60 hover:text-white'
            )}
          >I</button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg text-white/60 hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <RotateCcw size={11} /> Reset về bản gốc (giữ effect)
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
    reader.onload = ev => onChange({ dataUrl: ev.target.result, isEdited: true })
    reader.readAsDataURL(f)
    e.target.value = ''
  }
  return (
    <div className="space-y-3">
      {layer.dataUrl && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%, transparent 0% 50%) 50% / 16px 16px',
          }}
        >
          <img src={layer.dataUrl} alt={layer.name} className="w-full object-contain max-h-40" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {layer.isClippingMask && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
            style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', color: 'rgba(244,114,182,1)' }}>
            <Scissors size={11} /> Clipping Mask
          </div>
        )}
        {layer.isSmartObject && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: 'rgba(103,232,249,1)' }}>
            <Box size={11} /> Smart Object
          </div>
        )}
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg font-medium transition-colors"
        style={{ background: 'rgba(110,75,255,0.12)', border: '1px solid rgba(110,75,255,0.3)', color: 'rgba(196,181,253,1)' }}
      >
        <ImageIcon size={12} /> Thay ảnh (giữ mask & SO)
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleReplace} />
      </button>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg text-white/60 hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <RotateCcw size={11} /> Reset về bản gốc (giữ effect)
      </button>
    </div>
  )
}

function CommonControls({ layer, onChange }) {
  return (
    <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Opacity">
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={layer.opacity ?? 1}
            onChange={e => onChange({ opacity: Number(e.target.value), isEdited: true })}
            className="w-full accent-violet-500"
          />
          <p className="text-[10px] text-white/30 text-right">{Math.round((layer.opacity ?? 1) * 100)}%</p>
        </Field>
        <Field label="Blend Mode">
          <select
            value={layer.blendMode || 'normal'}
            onChange={e => onChange({ blendMode: e.target.value, isEdited: true })}
            className="w-full text-xs py-1.5 px-2 rounded-lg outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          >
            {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
      </div>
    </div>
  )
}

export default function PropertiesPanel({ layer, onChange, onReset }) {
  if (!layer) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
        <div
          className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Sparkles size={18} className="text-white/20" />
        </div>
        <p className="text-xs text-white/30">Chọn một layer để chỉnh sửa</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {layer.type === 'text'
          ? <Type size={14} className="text-violet-300" />
          : <ImageIcon size={14} className="text-cyan-300" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{layer.name}</p>
          <p className="text-[10px] text-white/30 capitalize">
            {layer.type} layer
            {layer.isClippingMask ? ' · clipping' : ''}
            {layer.isSmartObject ? ' · smart object' : ''}
          </p>
        </div>
      </div>

      {/* Type-specific */}
      {layer.type === 'text'
        ? <TextControls layer={layer} onChange={onChange} onReset={onReset} />
        : <ImageControls layer={layer} onChange={onChange} onReset={onReset} />}

      {/* Common (opacity / blend) */}
      <CommonControls layer={layer} onChange={onChange} />
    </div>
  )
}
