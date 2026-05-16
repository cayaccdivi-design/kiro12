// PSD tree walker for @webtoon/psd 0.4.x
// -------------------------------------------------------------
// Builds a flat array of editor-ready layer descriptors while
// preserving Photoshop semantics that matter for fidelity:
//   - groupPath          : ancestor group names (auto-detect Group)
//   - isClippingMask     : clipped to the layer beneath (auto-detect)
//   - isSmartObject      : detected from kind / placedLayerData
//   - isText             : node has a `text` payload
//   - effects            : parsed dropShadow/stroke/blendMode from
//                          layer metadata (best-effort, never throws)
// -------------------------------------------------------------

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

async function rgbaToDataUrl(rgba, width, height) {
  if (!width || !height || !rgba) return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imgData = ctx.createImageData(width, height)
  imgData.data.set(rgba)
  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL('image/png')
}

// Best-effort detection — different psd parsers expose this differently.
function detectClipping(node) {
  if (!node) return false
  // @webtoon/psd usually exposes additionalLayerProperties or layerFrame
  const f = node.layerFrame || node.layerProperties || {}
  const meta = node.additionalProperties || node.additionalLayerProperties || {}
  return Boolean(
    f.clipping === 1 ||
    meta.clipping === 1 ||
    node.isClippingMask === true ||
    node.clippingMask === true
  )
}

function detectSmartObject(node) {
  if (!node) return false
  const meta = node.additionalProperties || node.additionalLayerProperties || {}
  // Smart object identifiers in PSD spec: "PlLd", "SoLd", "SoLE"
  if (meta.PlLd || meta.SoLd || meta.SoLE) return true
  if (typeof node.kind === 'string' && /smart/i.test(node.kind)) return true
  if (node.isSmartObject === true) return true
  return false
}

function parseTextEffects(node) {
  // Try a few well-known shapes; never throw.
  try {
    const tp = node.textProperties || node.text || {}
    const engine = tp.EngineDict || tp.engineDict || {}
    const styleRun = engine.StyleRun || engine.styleRun || {}
    const runArray = styleRun.RunArray || styleRun.runArray || []
    const first = runArray[0]?.RunData || runArray[0]?.runData || {}
    const font = first.Font || first.font || {}
    const fillColor = first.FillColor || first.fillColor || {}
    return {
      fontFamily: font.Name || font.name || null,
      fontSize: font.Size || font.size || null,
      color: fillColor?.Values
        ? rgbaArrayToCss(fillColor.Values)
        : null,
    }
  } catch {
    return { fontFamily: null, fontSize: null, color: null }
  }
}

function rgbaArrayToCss(values) {
  // PSD often stores [a, r, g, b] in 0..1
  if (!Array.isArray(values) || values.length < 4) return null
  const [, r, g, b] = values
  const to255 = v => Math.max(0, Math.min(255, Math.round((v ?? 0) * 255)))
  return `rgb(${to255(r)},${to255(g)},${to255(b)})`
}

function parseEffects(node) {
  const effects = { dropShadow: null, stroke: null, blendMode: null, opacity: 1 }
  try {
    const meta = node.additionalProperties || node.additionalLayerProperties || {}
    if (typeof node.opacity === 'number') effects.opacity = node.opacity
    if (typeof node.blendMode === 'string') effects.blendMode = node.blendMode
    const fx = meta.lfx2 || meta.lrFX || meta.lmfx || null
    if (fx?.descriptor) {
      const d = fx.descriptor
      if (d.DrSh) effects.dropShadow = { raw: d.DrSh }
      if (d.FrFX) effects.stroke = { raw: d.FrFX }
    }
  } catch {
    /* best-effort */
  }
  return effects
}

/**
 * Walk a parsed PSD tree and return a flat layer array.
 * @param {object} psd - result of `Psd.parse(arrayBuffer)`
 * @param {(msg:string)=>void} [onProgress]
 */
export async function walkPsdLayers(psd, onProgress) {
  const flat = []
  // First pass: collect leaf layers + group context
  const queue = []
  function collect(nodes, groupPath) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        collect(node.children, [...groupPath, node.name || 'Group'])
      } else {
        queue.push({ node, groupPath })
      }
    }
  }
  collect(psd.children || [], [])

  for (let i = 0; i < queue.length; i++) {
    const { node, groupPath } = queue[i]
    onProgress?.(`Layer ${i + 1}/${queue.length}: ${node.name || 'Unnamed'}`)

    // some PSDs have layers with no pixel area (adjustment layers, etc.)
    const width = node.width || 0
    const height = node.height || 0

    const isText = node.text != null && node.text !== ''
    const isClippingMask = detectClipping(node)
    const isSmartObject = detectSmartObject(node)
    const effects = parseEffects(node)
    const textMeta = isText ? parseTextEffects(node) : null

    let dataUrl = null
    if (width > 0 && height > 0) {
      try {
        const composite = await node.composite()
        const rgba = composite instanceof Promise ? await composite : composite
        dataUrl = await rgbaToDataUrl(rgba, width, height)
      } catch {
        // ignore composite errors — we'll fall back to placeholder
      }
    }

    flat.push({
      id: uid(),
      name: node.name || `Layer ${i + 1}`,
      groupPath,                   // [] = root, otherwise list of parent group names
      type: isText ? 'text' : 'image',
      visible: !node.isHidden,
      left: node.left || 0,
      top: node.top || 0,
      width,
      height,
      // photoshop semantics
      isClippingMask,
      isSmartObject,
      blendMode: effects.blendMode,
      opacity: effects.opacity,
      effects,                     // raw parsed effect descriptors
      // text props
      textContent: isText
        ? (typeof node.text === 'string' ? node.text : (node.text?.content ?? ''))
        : undefined,
      originalTextContent: isText
        ? (typeof node.text === 'string' ? node.text : (node.text?.content ?? ''))
        : undefined,
      fontFamily: isText ? (textMeta?.fontFamily || 'Inter') : undefined,
      fontSize: isText ? (textMeta?.fontSize || 24) : undefined,
      color: isText ? (textMeta?.color || '#ffffff') : undefined,
      bold: false,
      italic: false,
      // image props
      dataUrl: !isText ? dataUrl : undefined,
      originalDataUrl: !isText ? dataUrl : undefined,
      // baked composite of THIS layer (preserves stroke/shadow/gradient/blend);
      // used as the visual source until the user explicitly edits the layer.
      bakedDataUrl: dataUrl,
      // when user edits, we flip this on — Konva renders from editable props
      isEdited: false,
    })
  }

  return flat
}

/**
 * Returns a fresh imageBitmap-friendly canvas masked by the
 * ORIGINAL layer's alpha channel. Used when swapping the image of a
 * clipping-mask or smart-object layer so its silhouette is preserved.
 */
export async function maskByOriginalAlpha(newImageDataUrl, originalDataUrl, width, height) {
  if (!newImageDataUrl || !originalDataUrl || !width || !height) return newImageDataUrl
  return new Promise((resolve, reject) => {
    const orig = new Image()
    const next = new Image()
    let loaded = 0
    const tryFinish = () => {
      if (++loaded < 2) return
      try {
        const c = document.createElement('canvas')
        c.width = width
        c.height = height
        const ctx = c.getContext('2d')
        // Cover-fit the new image into the layer box
        const ar = next.width / next.height
        const boxAr = width / height
        let dw, dh
        if (ar > boxAr) { dh = height; dw = dh * ar } else { dw = width; dh = dw / ar }
        const dx = (width - dw) / 2
        const dy = (height - dh) / 2
        ctx.drawImage(next, dx, dy, dw, dh)
        // Apply alpha mask from the original layer (clipping/smart-object silhouette)
        ctx.globalCompositeOperation = 'destination-in'
        ctx.drawImage(orig, 0, 0, width, height)
        ctx.globalCompositeOperation = 'source-over'
        resolve(c.toDataURL('image/png'))
      } catch (err) { reject(err) }
    }
    orig.onload = tryFinish; next.onload = tryFinish
    orig.onerror = reject;   next.onerror = reject
    orig.src = originalDataUrl
    next.src = newImageDataUrl
  })
}

export { rgbaToDataUrl }
