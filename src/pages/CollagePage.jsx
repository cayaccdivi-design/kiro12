import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Download, Image, LayoutGrid, X, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const LAYOUTS = [
  { id: 'h2',  label: '2 ngang',   cols: 2, rows: 1, slots: [{x:0,y:0,w:1,h:1},{x:1,y:0,w:1,h:1}] },
  { id: 'v2',  label: '2 dọc',     cols: 1, rows: 2, slots: [{x:0,y:0,w:1,h:1},{x:0,y:1,w:1,h:1}] },
  { id: 'g4',  label: '4 lưới',    cols: 2, rows: 2, slots: [{x:0,y:0,w:1,h:1},{x:1,y:0,w:1,h:1},{x:0,y:1,w:1,h:1},{x:1,y:1,w:1,h:1}] },
  { id: '1+2', label: '1+2',       cols: 3, rows: 2, slots: [{x:0,y:0,w:2,h:2},{x:2,y:0,w:1,h:1},{x:2,y:1,w:1,h:1}] },
  { id: '1+3', label: '1+3',       cols: 2, rows: 2, slots: [{x:0,y:0,w:1,h:2},{x:1,y:0,w:1,h:1},{x:1,y:1,w:1,h:1}] },
  { id: 'h3',  label: '3 ngang',   cols: 3, rows: 1, slots: [{x:0,y:0,w:1,h:1},{x:1,y:0,w:1,h:1},{x:2,y:0,w:1,h:1}] },
]

function drawCover(ctx, img, x, y, w, h, r) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = img.naturalWidth * scale
  const sh = img.naturalHeight * scale
  const sx = x + (w - sw) / 2
  const sy = y + (h - sh) / 2
  ctx.save()
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh)
  ctx.restore()
}

export default function CollagePage() {
  const [images, setImages] = useState([])
  const [layout, setLayout] = useState(LAYOUTS[0])
  const [gap, setGap] = useState(4)
  const [radius, setRadius] = useState(8)
  const [bgColor, setBgColor] = useState('#0a0a14')
  const [dragging, setDragging] = useState(false)
  const canvasRef = useRef(null)

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const canvasW = 1200
    const canvasH = Math.round(1200 * (layout.rows / layout.cols))
    canvas.width = canvasW
    canvas.height = canvasH

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvasW, canvasH)

    // Step 1: load all images in parallel, collect results indexed by slot
    const loadedImages = await Promise.all(
      layout.slots.map((slot, i) => {
        if (!images[i]) return Promise.resolve(null)
        return new Promise((resolve) => {
          const img = new window.Image()
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null)
          img.src = images[i].dataUrl
        })
      })
    )

    // Step 2: draw all slots in index order (no racing)
    layout.slots.forEach((slot, i) => {
      const slotX = slot.x * (canvasW / layout.cols)
      const slotY = slot.y * (canvasH / layout.rows)
      const slotW = slot.w * (canvasW / layout.cols)
      const slotH = slot.h * (canvasH / layout.rows)
      const innerX = slotX + gap / 2
      const innerY = slotY + gap / 2
      const innerW = slotW - gap
      const innerH = slotH - gap
      if (loadedImages[i]) {
        drawCover(ctx, loadedImages[i], innerX, innerY, innerW, innerH, radius)
      } else {
        drawPlaceholder(ctx, innerX, innerY, innerW, innerH, radius, i)
      }
    })
  }, [images, layout, gap, radius, bgColor])

  function drawPlaceholder(ctx, x, y, w, h, r, i) {
    ctx.save()
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r)
    } else {
      ctx.rect(x, y, w, h)
    }
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = `${Math.min(w, h) * 0.12}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Ảnh ${i + 1}`, x + w / 2, y + h / 2)
    ctx.restore()
  }

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  const handleImageUpload = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), dataUrl: e.target.result, name: file.name },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'collage.png'
    a.click()
  }

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const glassPanel = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    backdropFilter: 'blur(16px)',
  }

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ color: '#fff' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <LayoutGrid size={24} className="text-brand-400" />
          Ghép ảnh
        </h1>
        <p className="text-white/40 text-sm mt-1">Tạo ảnh ghép từ nhiều ảnh với nhiều bố cục khác nhau</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Left: Canvas Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={glassPanel}
          className="p-4 flex flex-col items-center gap-4"
        >
          <div className="w-full overflow-auto">
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Download size={16} />
            Tải xuống PNG
          </button>
        </motion.div>

        {/* Right: Controls */}
        <div className="space-y-4">
          {/* Upload zone */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              ...glassPanel,
              border: dragging
                ? '1.5px dashed rgba(124,58,237,0.7)'
                : '1.5px dashed rgba(255,255,255,0.12)',
            }}
            className="p-5"
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center gap-3 cursor-pointer py-4"
              onClick={() => document.getElementById('collage-file-input').click()}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                <Upload size={20} className="text-brand-400" />
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm font-medium">Kéo thả hoặc click để tải ảnh</p>
                <p className="text-white/30 text-xs mt-0.5">Hỗ trợ JPG, PNG, WebP</p>
              </div>
            </div>
            <input
              id="collage-file-input"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </motion.div>

          {/* Thumbnail strip */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={glassPanel}
              className="p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Image size={14} className="text-white/40" />
                <span className="text-xs text-white/50 font-medium">Ảnh đã tải ({images.length})</span>
                <button
                  onClick={() => setImages([])}
                  className="ml-auto flex items-center gap-1 text-xs text-rose-400/70 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={12} />
                  Xoá tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-14 h-14 object-cover rounded-lg"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(239,68,68,0.9)' }}
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Layout picker */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={glassPanel}
            className="p-4"
          >
            <p className="text-xs text-white/50 font-medium mb-3 uppercase tracking-widest">Bố cục</p>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l)}
                  className={clsx(
                    'py-2 px-3 rounded-xl text-xs font-medium transition-all',
                    layout.id === l.id
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70'
                  )}
                  style={
                    layout.id === l.id
                      ? { background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            style={glassPanel}
            className="p-4 space-y-4"
          >
            <p className="text-xs text-white/50 font-medium uppercase tracking-widest">Tuỳ chỉnh</p>

            {/* Gap */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-white/60">Khoảng cách</label>
                <span className="text-xs text-white/40">{gap}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Radius */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-white/60">Bo góc</label>
                <span className="text-xs text-white/40">{radius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Background color */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-white/60">Màu nền</label>
                <span className="text-xs text-white/40">{bgColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                  style={{ background: 'transparent', padding: 0 }}
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 text-xs rounded-lg px-3 py-2 text-white/80 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
