import { Eye, EyeOff, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'
import { useAuth } from '../../hooks/useAuth.js'

export default function Login() {
  const [email, setEmail] = useState('aarav.mehta@dayflow.co')
  const [password, setPassword] = useState('dayflow')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid work email.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try { const user = await login({ email, password }); navigate(user.role === 'HR' ? '/employee/dashboard' : (location.state?.from?.pathname || '/employee/dashboard'), { replace: true }) } catch { setError('Unable to sign in. Check your details and try again.') } finally { setLoading(false) }
  }
  return <AuthFrame title="Welcome back" description="Sign in to keep your workday moving." sideTitle="Work, beautifully aligned." sideCopy="A calmer, clearer way to stay connected to your work."><form onSubmit={submit} className="space-y-5"><Input label="Work email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error && !email ? 'Email is required.' : ''} required /><label className="block space-y-2"><span className="text-sm font-semibold text-[#34413c]">Password</span><span className="relative block"><input className="w-full rounded-xl border border-[#dfe6e2] bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-[#8fae36] focus:ring-4 focus:ring-[#d8ef69]/25" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-[#81908a]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p className="text-sm text-[#a85142]">{error}</p>}<Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'} {!loading && <ArrowRight size={17} />}</Button><p className="text-center text-sm text-[#81908a]">Don't have an account? <Link className="font-bold text-[#6f8d27]" to="/register">Register</Link></p></form></AuthFrame>
}

export function AuthFrame({ title, description, sideTitle, sideCopy, children }) { return <div className="grid min-h-screen bg-[#fbfcfb] lg:grid-cols-[0.9fr_1.1fr]"><section className="relative hidden overflow-hidden bg-[#17211f] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="relative z-10"><div className="display-font text-2xl">DAY<span className="text-[#d8ef69]">FLOW</span></div><p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9aa9a3]">Every workday, perfectly aligned.</p></div><div className="relative z-10 max-w-md"><div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8ef69] text-[#425612]"><ShieldCheck size={26} /></div><h2 className="display-font text-5xl leading-[1.08]">{sideTitle}</h2><p className="mt-5 text-lg leading-8 text-[#b8c7c0]">{sideCopy}</p><div className="mt-10 flex items-center gap-3 text-sm text-[#b8c7c0]"><Check size={16} className="text-[#d8ef69]" />One place for your everyday work</div></div><p className="relative z-10 text-xs text-[#81908a]">© 2026 Dayflow HRMS</p><div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border-[48px] border-[#33413c]" /></section><section className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><div className="display-font text-xl">DAY<span className="text-[#8aa82f]">FLOW</span></div></div><h1 className="display-font text-3xl">{title}</h1><p className="mt-2 text-sm text-[#81908a]">{description}</p><div className="mt-8">{children}</div></div></section></div> }
