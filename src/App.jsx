import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import EmployeeLayout from './components/layout/EmployeeLayout.jsx'
import { useAuth } from './hooks/useAuth.js'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Dashboard from './pages/employee/Dashboard.jsx'
import Profile from './pages/employee/Profile.jsx'
import Attendance from './pages/employee/Attendance.jsx'
import Leave from './pages/employee/Leave.jsx'
import Payroll from './pages/employee/Payroll.jsx'

function LandingRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/employee/dashboard' : '/login'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="payroll" element={<Payroll />} />
          </Route>
        </Route>
        <Route path="*" element={<LandingRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
