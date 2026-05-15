// Layer naming convention for Nova AI Studio PSD editor
// Tên layer chuẩn để web tự nhận diện và link với editor

export const LAYER_ROLES = {
  // TEXT layers
  text_1:     { role: 'text_1',     label: 'Nội dung chính',     type: 'text',  icon: 'Type' },
  text_2:     { role: 'text_2',     label: 'Nội dung phụ',       type: 'text',  icon: 'Type' },
  text_3:     { role: 'text_3',     label: 'Nội dung 3',         type: 'text',  icon: 'Type' },
  title_logo: { role: 'title_logo', label: 'Tên / Tiêu đề Logo', type: 'text',  icon: 'Type' },
  text_logo:  { role: 'text_logo',  label: 'Text logo phụ',      type: 'text',  icon: 'Type' },
  // IMAGE layers
  nvat_png:   { role: 'nvat_png',   label: 'Nhân vật PNG',       type: 'image', icon: 'User',       shape: 'rect'   },
  avt_png:    { role: 'avt_png',    label: 'Avatar (tròn)',       type: 'image', icon: 'UserCircle', shape: 'circle' },
  logo:       { role: 'logo',       label: 'Logo chính',          type: 'image', icon: 'Star',       shape: 'rect'   },
}

/**
 * Detect role from layer name (case-insensitive, trims whitespace)
 * @param {string} layerName
 * @returns {object|null} role object from LAYER_ROLES or null
 */
export function detectLayerRole(layerName) {
  if (!layerName) return null
  const clean = layerName.trim().toLowerCase()
  return LAYER_ROLES[clean] || null
}

/**
 * Group layers array into { text, image, other } based on LAYER_ROLES
 * @param {Array} layers - array of layer objects with .name property
 * @returns {{ text: Array, image: Array, other: Array }}
 */
export function groupLayersByRole(layers) {
  const result = { text: [], image: [], other: [] }
  for (const layer of layers) {
    const role = detectLayerRole(layer.name)
    if (role) {
      if (role.type === 'text') result.text.push({ ...layer, role })
      else result.image.push({ ...layer, role })
    } else {
      result.other.push(layer)
    }
  }
  return result
}
