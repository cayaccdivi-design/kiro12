// Layer naming convention for Nova AI Studio PSD editor
// ---------------------------------------------------------------
// Two distinct concerns share this file:
//   1. EDITABLE_TEXT_NAMES – strict whitelist of layer names whose
//      TEXT can be edited inside the in-browser PSD editor.
//   2. LAYER_ROLES – broader convention used by the *publish to shop*
//      and *customer editor* flows. Kept stable for backward compat.
// ---------------------------------------------------------------

// 1) Strict whitelist for in-editor text editing
export const EDITABLE_TEXT_NAMES = ['text_1', 'text_title', 'text_price']

export function isEditableTextLayer(name) {
  if (!name) return false
  return EDITABLE_TEXT_NAMES.includes(String(name).trim().toLowerCase())
}

export function editableTextHint() {
  return EDITABLE_TEXT_NAMES.join(', ')
}

// 2) Broader role mapping (publish-to-shop / customer editor)
export const LAYER_ROLES = {
  // TEXT layers
  text_1:     { role: 'text_1',     label: 'Tiêu đề chính',     type: 'text',  icon: 'Type' },
  text_title: { role: 'text_title', label: 'Tiêu đề',            type: 'text',  icon: 'Type' },
  text_price: { role: 'text_price', label: 'Giá',                type: 'text',  icon: 'Type' },
  // legacy aliases (kept so existing shop products still resolve)
  text_2:     { role: 'text_2',     label: 'Nội dung phụ',       type: 'text',  icon: 'Type' },
  text_3:     { role: 'text_3',     label: 'Nội dung 3',         type: 'text',  icon: 'Type' },
  title_logo: { role: 'title_logo', label: 'Tên / Tiêu đề Logo', type: 'text',  icon: 'Type' },
  text_logo:  { role: 'text_logo',  label: 'Text logo phụ',      type: 'text',  icon: 'Type' },
  // IMAGE layers
  nvat_png:   { role: 'nvat_png',   label: 'Nhân vật PNG',       type: 'image', icon: 'User',       shape: 'rect'   },
  avt_png:    { role: 'avt_png',    label: 'Avatar (tròn)',       type: 'image', icon: 'UserCircle', shape: 'circle' },
  logo:       { role: 'logo',       label: 'Logo chính',          type: 'image', icon: 'Star',       shape: 'rect'   },
}

export function detectLayerRole(layerName) {
  if (!layerName) return null
  const clean = String(layerName).trim().toLowerCase()
  return LAYER_ROLES[clean] || null
}

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
