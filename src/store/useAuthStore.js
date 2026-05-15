import { create } from 'zustand'

const STORAGE_KEY = 'nova_auth_v1'
const USERS_KEY   = 'nova_users_v1'

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
}
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || [] } catch { return [] }
}

export const useAuthStore = create((set, get) => ({
  user: loadAuth(),
  users: loadUsers(),
  isLoading: false,
  error: null,

  register: (name, email, password) => {
    const users = get().users
    if (users.find(u => u.email === email)) {
      set({ error: 'Email đã được sử dụng!' })
      return false
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      balance: 0,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
    }
    const updated = [...users, newUser]
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    set({ users: updated, user: newUser, error: null })
    return true
  },

  login: (email, password) => {
    const users = get().users
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) {
      set({ error: 'Email hoặc mật khẩu không đúng!' })
      return false
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    set({ user: found, error: null })
    return true
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null })
  },

  clearError: () => set({ error: null }),

  isAdmin: () => get().user?.email === 'finnlive246@gmail.com',

  addBalance: (amount) => {
    const user = get().users
    const current = get().user
    if (!current) return
    const updated = user.map(u =>
      u.id === current.id ? { ...u, balance: u.balance + amount } : u
    )
    const updatedUser = { ...current, balance: current.balance + amount }
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
    set({ users: updated, user: updatedUser })
  },

  deductBalance: (amount) => {
    const user = get().user
    if (!user || user.balance < amount) return false
    const users = get().users
    const updated = users.map(u =>
      u.id === user.id ? { ...u, balance: u.balance - amount } : u
    )
    const updatedUser = { ...user, balance: user.balance - amount }
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
    set({ users: updated, user: updatedUser })
    return true
  },
}))
