import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ShopPage from './pages/ShopPage'
import GiftPage from './pages/GiftPage'
import RemoveBgPage from './pages/RemoveBgPage'
import ResourcesPage from './pages/ResourcesPage'
import TopupPage from './pages/TopupPage'
import { useAuthStore } from './store/useAuthStore'

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/gift" element={<GiftPage />} />
        <Route path="/remove-bg" element={<RemoveBgPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/topup" element={
          <ProtectedRoute><TopupPage /></ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
