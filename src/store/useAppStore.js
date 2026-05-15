import { create } from 'zustand'

const OWNED_KEY = 'nova_owned_v1'

function loadOwned() {
  try { return JSON.parse(localStorage.getItem(OWNED_KEY)) || [] } catch { return [] }
}

export const useAppStore = create((set, get) => ({
  owned: loadOwned(),
  toasts: [],
  sidebarOpen: true,
  mobileSidebarOpen: false,

  addOwned: (productId) => {
    const owned = [...get().owned, productId]
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned))
    set({ owned })
  },

  isOwned: (productId) => get().owned.includes(productId),

  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),

  toast: (message, type = 'info', title = '') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, message, type, title }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3200)
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
