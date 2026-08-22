import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', headers: { 'Content-Type': 'application/json' } })
const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true'
const request = (realRequest, mockRequest) => useMockApi ? Promise.resolve({ data: mockRequest() }) : realRequest()

export const authService = {
	register: (payload) => request(() => api.post('/register', { ...payload, role: 'EMPLOYEE' }), () => ({ ...mockUser, name: payload.name, email: payload.email })),
	login: (payload) => request(() => api.post('/login', payload), () => mockUser),
	me: () => request(() => api.get('/me'), () => mockUser),
}
export const employeeService = { getMe: () => request(() => api.get('/employees/me'), () => mockEmployee), updateMe: (payload) => request(() => api.put('/employees/me', payload), () => ({ ...mockEmployee, ...payload })) }
export const attendanceService = { getMine: () => request(() => api.get('/attendance/me'), () => mockAttendance), checkIn: () => request(() => api.post('/attendance/check-in'), () => ({ ...mockAttendance[0], checkIn: new Date().toISOString(), status: 'Present' })), checkOut: () => request(() => api.post('/attendance/check-out'), () => ({ ...mockAttendance[0], checkOut: new Date().toISOString(), status: 'Present' })) }
export const leaveService = { getMine: () => request(() => api.get('/leaves/me'), () => [...mockLeaves]), create: (payload) => request(() => api.post('/leaves', payload), () => { const leave = { ...payload, id: Date.now(), status: 'Pending' }; mockLeaves.unshift(leave); return leave }) }
export const payrollService = { getMine: () => request(() => api.get('/payroll/me'), () => mockPayroll) }

const mockUser = { id: 'EMP-2048', name: 'Aarav Mehta', email: 'aarav.mehta@dayflow.co', role: 'EMPLOYEE', position: 'Product Designer', department: 'Design', location: 'Bengaluru' }
const mockEmployee = { ...mockUser, phone: '+91 98765 43210', address: 'Indiranagar, Bengaluru', profilePicture: '' }
const mockAttendance = [{ id: 1, date: '2026-08-22', checkIn: '2026-08-22T09:18:00', checkOut: null, status: 'Present' }, { id: 2, date: '2026-08-21', checkIn: '2026-08-21T09:04:00', checkOut: '2026-08-21T18:12:00', status: 'Present' }, { id: 3, date: '2026-08-20', checkIn: null, checkOut: null, status: 'Leave' }]
const mockLeaves = []
const mockPayroll = { basicSalary: 70000, allowances: 35000, deductions: 20500, netSalary: 84500 }
export default api