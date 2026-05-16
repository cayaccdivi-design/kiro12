import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect, Transformer } from 'react-konva'

// Hook: load a dataUrl into an HTMLImageElement once.
function useImage(dataUrl) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!dataUrl) { setImg(null); return }
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => setImg(i)
    i.src = dataUrl
  }, [dataUrl])
  return img
}

// One PSD layer rendered to Konva. Mode is auto-selected:
//   - text + isEdited        => live Konva Text (full effect controls)
//   - image + isEdited       => live KonvaImage (replaced source)
//   - otherwise              => the baked composite (preserves all
//                              native PS effects: gradient, stroke,
//                              shadow, blend, clipping mask, SO, etc.)
function LayerNode({ layer, isSelected, onSelect, transformerRef, onChange }) {
  const baked = useImage(layer.bakedDataUrl)
  const replaced = useImage(layer.dataUrl !== layer.originalDataUrl ? layer.dataUrl : null)
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

  const opacity = layer.opacity ?? 1
  const blendMode = layer.blendMode && layer.blendMode !== 'normal'
    ? layer.blendMode
    : 'source-over'

  const common = {
    ref: nodeRef,
    x: layer.left,
    y: layer.top,
    opacity,
    globalCompositeOperation: blendMode,
    onClick: () => onSelect(layer.id),
    onTap: () => onSelect(layer.id),
    draggable: true,
    onDragEnd: e => onChange?.(layer.id, { left: e.target.x(), top: e.target.y() }),
    onTransformEnd: e => {
      const node = e.target
      onChange?.(layer.id, {
        left: node.x(),
        top: node.y(),
        width: Math.max(5, node.width() * node.scaleX()),
        height: Math.max(5, node.height() * node.scaleY()),
      })
      node.scaleX(1); node.scaleY(1)
    },
  }

  // ── TEXT ──
  if (layer.type === 'text') {
    if (layer.isEdited) {
      const fontStyle = [layer.bold ? 'bold' : '', layer.italic ? 'italic' : '']
        .filter(Boolean).join(' ') || 'normal'
      // Synthesize stroke / shadow from parsed effects metadata so the
      // updated text still feels Photoshop-y.
      const eff = layer.effects || {}
      const shadow = eff.dropShadow ? {
        shadowColor: 'rgba(0,0,0,0.6)',
        shadowBlur: 6,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      } : {}
      const stroke = eff.stroke ? {
        stroke: '#000',
        strokeWidth: 1.5,
        fillAfterStrokeEnabled: true,
      } : {}
      return (
        <KonvaText
          {...common}
          text={layer.textContent || ''}
          fontFamily={layer.fontFamily || 'Inter'}
          fontSize={layer.fontSize || 16}
          fill={layer.color || '#ffffff'}
          fontStyle={fontStyle}
          width={layer.width}
          {...stroke}
          {...shadow}
        />
      )
    }
    // Unedited text: render the baked image so original effects are pixel-perfect
    if (!baked) return null
    return (
      <KonvaImage
        {...common}
        image={baked}
        width={layer.width}
        height={layer.height}
      />
    )
  }

  // ── IMAGE ──
  // For unedited images and replaced images we render KonvaImage.
  // The replaced source may already have been alpha-masked upstream
  // (clipping / smart-object preservation) — we just draw it.
  const img = replaced || baked
  if (!img) return null
  return (
    <KonvaImage
      {...common}
      image={img}
      width={layer.width}
      height={layer.height}
    />
  )
}

const PsdCanvas = forwardRef(function PsdCanvas(
  {
    psdMeta,
    layers,
    selectedLayerId,
    zoom,
    onSelectLayer,
    onLayerChange,
    showWatermark = true,
  },
  stageRef,
) {
  const transformerRef = useRef(null)
  const watermarkRef = useRef(null)

  const stageWidth = psdMeta ? psdMeta.width * zoom : 0
  const stageHeight = psdMeta ? psdMeta.height * zoom : 0

  const watermarkFontSize = useMemo(() => (
    psdMeta ? Math.max(20, Math.min(psdMeta.width, psdMeta.height) * 0.08) : 60
  ), [psdMeta])

  // Expose hide/show watermark imperatively for export
  useEffect(() => {
    if (!stageRef?.current) return
    stageRef.current._novaWatermarkRef = watermarkRef
  }, [stageRef])

  if (!psdMeta) return null

  return (
    <div style={{ width: stageWidth, height: stageHeight, flexShrink: 0 }}>
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={e => {
          // click on empty area deselects
          if (e.target === e.target.getStage()) onSelectLayer(null)
        }}
      >
        <Layer>
          {/* Transparent backdrop for hit-testing */}
          <Rect x={0} y={0} width={psdMeta.width} height={psdMeta.height}
            fill="rgba(0,0,0,0)" listening={false} />

          {layers
            .filter(l => l.visible)
            .map(layer => (
              <LayerNode
                key={layer.id}
                layer={layer}
                isSelected={layer.id === selectedLayerId}
                onSelect={onSelectLayer}
                onChange={onLayerChange}
                transformerRef={transformerRef}
              />
            ))}

          {showWatermark && (
            <KonvaText
              ref={watermarkRef}
              text="NOVA AI STUDIO"
              x={psdMeta.width / 2}
              y={psdMeta.height / 2}
              rotation={-35}
              opacity={0.22}
              fill="rgba(255,255,255,0.5)"
              fontSize={watermarkFontSize}
              fontStyle="bold"
              offsetX={watermarkFontSize * 4}
              offsetY={watermarkFontSize / 2}
              listening={false}
            />
          )}

          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            anchorSize={8}
            borderStroke="rgba(167,139,250,0.9)"
            anchorStroke="rgba(167,139,250,0.9)"
            anchorFill="#0c0c14"
          />
        </Layer>
      </Stage>
    </div>
  )
})

export default PsdCanvas
