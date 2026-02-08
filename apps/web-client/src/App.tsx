import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './views/login'
import Register from './views/register'
import NotFound from './views/not-found'
import Home from './views/Home';
import MyRequests from './views/my-requests';
import Search from './views/search';
import Profile from './views/profile';
import Chat from './views/chat';
import ReviewRequest from './views/review/requestId';
import CompleteProfile from './views/profile/complete-profile'
import AddService from './views/provider/add-service'
import EditProviderProfile from './views/provider/edit-profile'
import ProviderServices from './views/provider/services'
import ProviderDetail from './views/provider/ProviderDetail'
import CategoriesManagement from './views/admin/categories-management'
import ProviderRequests from './views/admin/provider-requests'
import ServicesApproval from './views/admin/services-approval'
import BecomeProvider from './views/profile/become-provider';
import ChatDetail from './views/chat/ChatDetail';
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Cargando...</div>
  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/review/:requestId" element={<ProtectedRoute><ReviewRequest /></ProtectedRoute>} />
        <Route path="/provider/add-service" element={<ProtectedRoute><AddService /></ProtectedRoute>} />
        <Route path="/provider/edit-profile" element={<ProtectedRoute><EditProviderProfile /></ProtectedRoute>} />
        <Route path="/provider/services" element={<ProtectedRoute><ProviderServices /></ProtectedRoute>} />
        <Route path="/profile/become-provider" element={<ProtectedRoute><BecomeProvider /></ProtectedRoute>} />
        <Route path="/profile/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path="/admin/categories-management" element={<ProtectedRoute><CategoriesManagement /></ProtectedRoute>} />
        <Route path="/admin/provider-requests" element={<ProtectedRoute><ProviderRequests /></ProtectedRoute>} />
        <Route path="/admin/services-approval" element={<ProtectedRoute><ServicesApproval /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><ChatDetail /></ProtectedRoute>} />
        <Route path="/provider/:id" element={<ProtectedRoute><ProviderDetail /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
