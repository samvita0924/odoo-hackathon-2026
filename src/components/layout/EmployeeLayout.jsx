import { useState } from 'react'
import { Bell, BriefcaseBusiness, CalendarDays, ChevronDown, CircleDollarSign, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const navigation = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/employee/profile', icon: UserRound },
  { label: 'Attendance', path: '/employee/attendance', icon: CalendarDays },
  { label: 'Leave', path: '/employee/leave', icon: BriefcaseBusiness },
  { label: 'Payroll', path: '/employee/payroll', icon: CircleDollarSign },
]

export default function EmployeeLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const current = navigation.find((item) => location.pathname === item.path)
  const handleLogout = () => { logout(); navigate('/login') }
  return <div className="min-h-screen bg-[#f5f7f6] text-[#17211f]">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#e1e9e4] bg-[#fbfcfb] px-5 py-6 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2"><NavLink to="/employee/dashboard" className="display-font text-xl tracking-tight">DAY<span className="text-[#94b83e]">FLOW</span></NavLink><button className="rounded-lg p-1 text-[#81908a] lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <p className="mb-10 mt-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9aa9a3]">Employee workspace</p>
      <nav className="space-y-1">{navigation.map((item) => { const NavigationIcon = item.icon; return <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#eaf5c8] text-[#334414]' : 'text-[#718078] hover:bg-[#eef3f0] hover:text-[#34413c]'}`}><NavigationIcon size={18} strokeWidth={1.8} />{item.label}</NavLink> })}</nav>
      <div className="mt-auto border-t border-[#e1e9e4] pt-5"><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#718078] transition hover:bg-[#fff0ed] hover:text-[#a85142]"><LogOut size={18} strokeWidth={1.8} />Logout</button></div>
    </aside>
    {open && <button aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-[#17211f]/25 lg:hidden" />}
    <div className="lg:pl-64"><header className="flex h-[76px] items-center justify-between border-b border-[#e1e9e4] bg-[#fbfcfb] px-5 sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="rounded-xl p-2 text-[#596861] hover:bg-[#eef3f0] lg:hidden" aria-label="Open navigation"><Menu size={21} /></button><div><p className="text-xs font-medium text-[#94a19b]">Employee workspace</p><h1 className="display-font text-lg sm:text-xl">{current?.label || 'Dayflow'}</h1></div></div><div className="flex items-center gap-3"><button aria-label="Notifications" className="relative rounded-xl p-2.5 text-[#718078] hover:bg-[#eef3f0]"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e0705e]" /></button><div className="hidden h-8 w-px bg-[#e1e9e4] sm:block" /><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8ef69] text-xs font-extrabold text-[#425612]">AM</div><div className="hidden sm:block"><p className="text-sm font-bold">{user?.name || 'Aarav Mehta'}</p><p className="text-xs text-[#81908a]">{user?.position || user?.role || 'Employee'}</p></div><ChevronDown className="hidden text-[#9aa9a3] sm:block" size={16} /></div></div></header><main className="mx-auto max-w-[1440px] p-5 sm:p-8"><Outlet /></main></div>
  </div>
}