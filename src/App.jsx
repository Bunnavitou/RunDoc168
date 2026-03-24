import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import Billing from './pages/Billing'
import InvoiceDetail from './pages/InvoiceDetail'
import More from './pages/More'
import Property from './pages/Property'
import ServiceFees from './pages/ServiceFees'
import InvoiceSetup from './pages/InvoiceSetup'
import SubUsers from './pages/SubUsers'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

export default function App() {
  const isLoggedIn = useStore(s => s.isLoggedIn)

  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <Login />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Routes>
        {/* Pages with bottom navigation */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Rooms />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/more" element={<More />} />
        </Route>
        {/* Detail pages without bottom nav */}
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route path="/tenant/:id" element={<TenantDetail />} />
        <Route path="/invoice/:id" element={<InvoiceDetail />} />
        <Route path="/property" element={<Property />} />
        <Route path="/services" element={<ServiceFees />} />
        <Route path="/invoice-setup" element={<InvoiceSetup />} />
        <Route path="/sub-users" element={<SubUsers />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
