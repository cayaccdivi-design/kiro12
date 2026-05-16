import { motion } from 'framer-motion'
import {
  Eye, EyeOff, Type, Image as ImageIcon, Folder, FolderOpen,
  Scissors, Box, Lock, ChevronRight, ChevronDown, GripVertical,
} from 'lucide-react'
import clsx from 'clsx'
import { detectLayerRole, isEditableTextLayer } from '../../utils/layerNaming'

// ---------------------------------------------------------------------------
// Icon picker reflects auto-detected Photoshop semantics.
// ---------------------------------------------------------------------------
function LayerIcon({ layer, expanded, size = 13 }) {
  if (layer.isGroup) {
    return expanded
      ? <FolderOpen size={size} className="text-amber-300" />
      : <Folder size={size} className="text-amber-300/85" />
  }
  if (layer.isClippingMask) return <Scissors size={size} className="text-pink-300" />
  if (layer.isSmartObject)  return <Box size={size} className="text-cyan-300" />
  if (layer.type === 'text') return <Type size={size} className="text-violet-300" />
  return <ImageIcon size={size} className="text-white/60" />
}

// ---------------------------------------------------------------------------
// Tag pills shown on the right side of a layer row.
// ---------------------------------------------------------------------------
function MetaPills({ layer }) {
  const pills = []
  if (layer.isClippingMask) pills.push({ label: 'Clip', color: 'pink' })
  if (layer.isSmartObject)  pills.push({ label: 'SO',   color: 'cyan' })
  const role = detectLayerRole(layer.name)
  if (role) pills.push({ label: role.label, color: role.type === 'text' ? 'violet' : 'teal' })
  if (layer.type === 'text' && !isEditableTextLayer(layer.name)) {
    pills.push({ label: 'locked', color: 'amber' })
  }
  if (layer.blendMode && layer.blendMode !== 'source-over') {
    pills.push({ label: layer.blendMode, color: 'slate' })
  }
  if (!pills.length) return null
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
        '--c-slate':  '148,163,184',
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

// ---------------------------------------------------------------------------
// LayerRow – fully featured Photoshop-style row.
// Supports: indent for nesting, group expand/collapse, visibility toggle,
//           thumbnail, drag handle for reorder, lock indicator, role badges.
// ---------------------------------------------------------------------------
export default function LayerRow({
  layer,
  selected,
  expanded,
  onSelect,
  onToggleVisible,
  onToggleExpand,
  depth = 0,
  // drag-and-drop wiring (handled by parent panel)
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  isBeingDragged,
}) {
  const inheritedHidden = layer.inheritedVisible === false
  const indent = 8 + depth * 12

  return (
    <motion.div
      layout
      onClick={() => onSelect?.(layer.id)}
      draggable={Boolean(onDragStart)}
      onDragStart={e => onDragStart?.(e, layer)}
      onDragOver={e => { e.preventDefault(); onDragOver?.(e, layer) }}
      onDrop={e => onDrop?.(e, layer)}
      className={clsx(
        'group flex items-center gap-1.5 pr-2 py-1.5 rounded-md cursor-pointer text-sm select-none transition-colors',
        selected
          ? 'bg-violet-500/25 ring-1 ring-violet-500/50 text-white'
          : 'text-white/75 hover:bg-white/[0.05] ring-1 ring-transparent',
        isDragOver && !selected && 'bg-violet-500/10 ring-1 ring-violet-400/40',
        isBeingDragged && 'opacity-40',
      )}
      style={{ paddingLeft: indent }}
    >
      {/* drag handle */}
      <span
        className="flex-shrink-0 text-white/20 group-hover:text-white/50 cursor-grab active:cursor-grabbing"
        title="Kéo để sắp xếp lại"
      >
        <GripVertical size={11} />
      </span>

      {/* group expand chevron */}
      {layer.isGroup ? (
        <button
          onClick={e => { e.stopPropagation(); onToggleExpand?.(layer.id) }}
          className="flex-shrink-0 text-white/50 hover:text-white"
        >
          {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>
      ) : (
        <span className="w-[11px] flex-shrink-0" />
      )}

      {/* visibility toggle */}
      <button
        onClick={e => { e.stopPropagation(); onToggleVisible?.(layer.id) }}
        className={clsx(
          'flex-shrink-0 transition-colors',
          inheritedHidden
            ? 'text-white/15'
            : layer.visible
              ? 'text-white/60 hover:text-white'
              : 'text-white/20 hover:text-white/60',
        )}
        title={
          inheritedHidden
            ? 'Bị ẩn do group cha'
            : layer.visible
              ? 'Ẩn layer'
              : 'Hiện layer'
        }
      >
        {layer.visible && !inheritedHidden ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>

      <LayerIcon layer={layer} expanded={expanded} />

      {/* thumbnail for image layers */}
      {!layer.isGroup && layer.type === 'image' && layer.bakedDataUrl && (
        <img
          src={layer.bakedDataUrl}
          alt=""
          className="w-6 h-6 object-cover rounded flex-shrink-0"
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            background:
              'repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%) 50% / 6px 6px',
          }}
        />
      )}

      <span className={clsx(
        'truncate flex-1 text-xs',
        inheritedHidden && 'opacity-50',
      )}>
        {layer.name}
      </span>

      <div className="flex items-center gap-1 flex-shrink-0">
        <MetaPills layer={layer} />
        {layer.type === 'text' && !isEditableTextLayer(layer.name) && !layer.isGroup && (
          <Lock size={10} className="text-amber-300/60" />
        )}
      </div>
    </motion.div>
  )
}
