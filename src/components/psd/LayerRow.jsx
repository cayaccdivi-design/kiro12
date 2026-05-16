import { motion } from 'framer-motion'
import {
  Eye, EyeOff, Type, Image as ImageIcon, Folder,
  Scissors, Box, Lock, ChevronRight, ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'
import { detectLayerRole, isEditableTextLayer } from '../../utils/layerNaming'

// Icon picker reflects auto-detected Photoshop semantics.
function LayerIcon({ layer, size = 13 }) {
  if (layer.isGroup)        return <Folder       size={size} className="text-amber-300/80" />
  if (layer.isClippingMask) return <Scissors     size={size} className="text-pink-300/80" />
  if (layer.isSmartObject)  return <Box          size={size} className="text-cyan-300/80" />
  if (layer.type === 'text') return <Type        size={size} className="text-violet-300/80" />
  return <ImageIcon size={size} className="text-white/40" />
}

function MetaPills({ layer }) {
  const pills = []
  if (layer.isClippingMask) pills.push({ label: 'Clip', color: 'pink' })
  if (layer.isSmartObject)  pills.push({ label: 'SO',   color: 'cyan' })
  const role = detectLayerRole(layer.name)
  if (role) pills.push({ label: role.label, color: role.type === 'text' ? 'violet' : 'teal' })
  if (layer.type === 'text' && !isEditableTextLayer(layer.name)) {
    pills.push({ label: 'locked', color: 'amber' })
  }
  return pills.map((p, i) => (
    <span
      key={i}
      className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{
        background: `rgba(var(--c-${p.color},255,255,255),0.18)`,
        border: `1px solid rgba(var(--c-${p.color},255,255,255),0.35)`,
        color: `rgba(var(--c-${p.color},255,255,255),1)`,
        '--c-pink':   '236,72,153',
        '--c-cyan':   '34,211,238',
        '--c-violet': '167,139,250',
        '--c-teal':   '45,212,191',
        '--c-amber':  '251,191,36',
        maxWidth: 86,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {p.label}
    </span>
  ))
}

/**
 * Single row in the Photoshop-style layer panel.
 * Supports: nested indent, group expand/collapse, visibility toggle,
 * lock indicator, role badges, thumbnail.
 */
export default function LayerRow({
  layer,
  selected,
  expanded,
  onSelect,
  onToggleVisible,
  onToggleExpand,
  depth = 0,
}) {
  return (
    <motion.div
      layout
      onClick={() => onSelect(layer.id)}
      className={clsx(
        'group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm select-none',
        'transition-colors',
        selected
          ? 'bg-violet-500/20 ring-1 ring-violet-500/40 text-white'
          : 'text-white/70 hover:bg-white/[0.05] ring-1 ring-transparent'
      )}
      style={{ paddingLeft: 8 + depth * 12 }}
    >
      {/* Group expand chevron */}
      {layer.isGroup ? (
        <button
          onClick={e => { e.stopPropagation(); onToggleExpand?.(layer.id) }}
          className="flex-shrink-0 text-white/40 hover:text-white"
        >
          {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>
      ) : (
        <span className="w-[11px] flex-shrink-0" />
      )}

      {/* Visibility */}
      <button
        onClick={e => { e.stopPropagation(); onToggleVisible(layer.id) }}
        className="flex-shrink-0 text-white/30 hover:text-white/80 transition-colors"
        title={layer.visible ? 'Ẩn layer' : 'Hiện layer'}
      >
        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>

      <LayerIcon layer={layer} />

      {/* Thumbnail for image layers */}
      {layer.type === 'image' && layer.bakedDataUrl && (
        <img
          src={layer.bakedDataUrl}
          alt=""
          className="w-7 h-7 object-cover rounded flex-shrink-0"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              'repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%) 50% / 8px 8px',
          }}
        />
      )}

      <span className="truncate flex-1 text-xs">
        {layer.name}
      </span>

      <div className="flex items-center gap-1 flex-shrink-0">
        <MetaPills layer={layer} />
        {layer.type === 'text' && !isEditableTextLayer(layer.name) && (
          <Lock size={10} className="text-amber-300/60" />
        )}
      </div>
    </motion.div>
  )
}
