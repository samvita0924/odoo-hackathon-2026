import { createContext, useEffect, useState } from 'react'
import { authService } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('dayflow_user') || 'null'))
  const login = async (credentials) => { const response = await authService.login(credentials); const nextUser = response.data; localStorage.setItem('dayflow_user', JSON.stringify(nextUser)); setUser(nextUser); return nextUser }
  const register = async (details) => { const response = await authService.register(details); const nextUser = response.data; localStorage.setItem('dayflow_user', JSON.stringify(nextUser)); setUser(nextUser); return nextUser }
  const logout = () => { localStorage.removeItem('dayflow_user'); setUser(null) }
  useEffect(() => { document.title = user ? 'Dayflow | Employee workspace' : 'Dayflow HRMS' }, [user])
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export { AuthContext }