import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Request from './pages/Request'
import RequestDetail from './pages/RequestDetail'
import Approval from './pages/Approval'
import More from './pages/More'
import Profile from './pages/Profile'
import NewRequest from './pages/NewRequest'
import BudgetManagement from './pages/BudgetManagement'
import NewBudget from './pages/NewBudget'
import ExpenseCategory from './pages/ExpenseCategory'
import SubUsers from './pages/SubUsers'
import NewUser from './pages/NewUser'
import EditUser from './pages/EditUser'
import TypeOfRequest from './pages/TypeOfRequest'
import NewApprovalType from './pages/NewApprovalType'
import TermsAndConditions from './pages/TermsAndConditions'
import Settings from './pages/Settings'
import ManageDepartments from './pages/ManageDepartments'

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
        {/* Main tab pages with bottom navigation */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/request" element={<Request />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/more" element={<More />} />
        </Route>

        {/* Detail / settings pages without bottom nav */}
        <Route path="/request/new" element={<NewRequest />} />
        <Route path="/request/:id" element={<RequestDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/budget" element={<BudgetManagement />} />
        <Route path="/budget/new" element={<NewBudget />} />
        <Route path="/expense-category" element={<ExpenseCategory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sub-users" element={<SubUsers />} />
        <Route path="/sub-users/new" element={<NewUser />} />
        <Route path="/sub-users/:id" element={<EditUser />} />
        <Route path="/approval-types" element={<TypeOfRequest />} />
        <Route path="/approval-types/new" element={<NewApprovalType />} />
        <Route path="/approval-types/:id" element={<NewApprovalType />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/departments" element={<ManageDepartments />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
