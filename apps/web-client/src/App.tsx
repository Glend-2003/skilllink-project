import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './context/AuthContext'
import { useRole } from './context/RoleContext'
import { Navigation } from './components/Navigation'
import Login from './views/login'
import Register from './views/register'
import NotFound from './views/not-found'
import Home from './views/Home';
import RequestsRouter from './views/RequestsRouter';
import Search from './views/search';
import Profile from './views/profile';
import Chat from './views/chat';
import ReviewRequest from './views/review/requestId';
import RequestService from './views/request-service';
import CompleteProfile from './views/profile/complete-profile'
import AddService from './views/provider/add-service'
import EditService from './views/provider/edit-service'
import EditProviderProfile from './views/provider/edit-profile'
import ProviderServices from './views/provider/services'
import ProviderDetail from './views/provider/ProviderDetail'
import CategoriesManagement from './views/admin/categories-management'
import AdminProviderRequests from './views/admin/provider-requests'
import ServicesApproval from './views/admin/services-approval'
import BecomeProvider from './views/profile/become-provider';
import ChatDetail from './views/chat/ChatDetail';
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Cargando...</div>
  return user ? <>{children}</> : <Navigate to="/login" />
}

function ProviderRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { isProvider } = useRole()
  if (isLoading) return <div>Cargando...</div>
  
  if (!user) return <Navigate to="/login" />
  if (!isProvider) {
    // Redirigir a la página de perfil o dashboard según corresponda
    return <Navigate to="/profile" />
  }
  
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { isAdmin } = useRole()
  if (isLoading) return <div>Cargando...</div>
  
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) {
    return <Navigate to="/" />
  }
  
  return <>{children}</>
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const hideNavigation = ['/login', '/register'].includes(location.pathname)
  
  return (
    <>
      {!hideNavigation && <Navigation />}
      {children}
    </>
  )
}

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-requests" element={<ProtectedRoute><RequestsRouter /></ProtectedRoute>} />
          <Route path="/provider/my-requests" element={<Navigate to="/my-requests" replace />} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/review/:requestId" element={<ProtectedRoute><ReviewRequest /></ProtectedRoute>} />
          <Route path="/request-service" element={<ProtectedRoute><RequestService /></ProtectedRoute>} />
          {/* Rutas de Proveedor - Requieren aprobación */}
          <Route path="/provider/add-service" element={<ProviderRoute><AddService /></ProviderRoute>} />
          <Route path="/provider/edit-service" element={<ProviderRoute><EditService /></ProviderRoute>} />
          <Route path="/provider/edit-profile" element={<ProviderRoute><EditProviderProfile /></ProviderRoute>} />
          <Route path="/provider/services" element={<ProviderRoute><ProviderServices /></ProviderRoute>} />
          <Route path="/profile/become-provider" element={<ProtectedRoute><BecomeProvider /></ProtectedRoute>} />
          <Route path="/profile/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          {/* Rutas de Admin */}
          <Route path="/admin/categories-management" element={<AdminRoute><CategoriesManagement /></AdminRoute>} />
          <Route path="/admin/provider-requests" element={<AdminRoute><AdminProviderRequests /></AdminRoute>} />
          <Route path="/admin/services-approval" element={<AdminRoute><ServicesApproval /></AdminRoute>} />
          {/* Rutas Públicas */}
          <Route path="/chat/:id" element={<ProtectedRoute><ChatDetail /></ProtectedRoute>} />
          <Route path="/provider/:id" element={<ProtectedRoute><ProviderDetail /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
