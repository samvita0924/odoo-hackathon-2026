import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', headers: { 'Content-Type': 'application/json' } })
const mock = import.meta.env.VITE_USE_MOCK_API === 'true'
const call = (real, fallback) => mock ? Promise.resolve({ data: fallback() }) : real()

const employees = [
  { id: 'EMP001', name: 'Priya Sharma', email: 'priya@dayflow.co', phone: '+91 98765 00001', address: 'Koramangala, Bengaluru', department: 'Engineering', position: 'Software Engineer', role: 'EMPLOYEE', status: 'Present', salary: 33000 },
  { id: 'EMP002', name: 'Arun Kumar', email: 'arun@dayflow.co', phone: '+91 98765 00002', address: 'Andheri, Mumbai', department: 'HR', position: 'HR Executive', role: 'EMPLOYEE', status: 'Leave', salary: 42000 },
  { id: 'EMP003', name: 'Kavin Raj', email: 'kavin@dayflow.co', phone: '+91 98765 00003', address: 'T Nagar, Chennai', department: 'Finance', position: 'Accountant', role: 'EMPLOYEE', status: 'Absent', salary: 38000 },
]
const attendance = employees.flatMap((employee, employeeIndex) => Array.from({ length: 10 }, (_, index) => ({ id: `${employee.id}-${index}`, employeeId: employee.id, employeeName: employee.name, date: `2026-08-${String(index + 1).padStart(2, '0')}`, checkIn: index % 5 === 0 ? null : `2026-08-${String(index + 1).padStart(2, '0')}T09:1${employeeIndex}:00`, checkOut: index % 5 === 0 ? null : `2026-08-${String(index + 1).padStart(2, '0')}T18:00:00`, status: index % 5 === 0 ? 'Absent' : index === 2 ? 'Half-day' : 'Present' })))
const leaves = [{ id: 'LV001', employeeId: 'EMP001', employeeName: 'Priya Sharma', leaveType: 'Sick Leave', startDate: '2026-08-12', endDate: '2026-08-14', remarks: 'Medical appointment', status: 'Pending' }, { id: 'LV002', employeeId: 'EMP002', employeeName: 'Arun Kumar', leaveType: 'Paid Leave', startDate: '2026-08-18', endDate: '2026-08-19', remarks: 'Personal time', status: 'Approved' }]
const payroll = employees.map((employee) => ({ employeeId: employee.id, employeeName: employee.name, basicSalary: employee.salary - 7000, allowances: 7000, deductions: 2000, netSalary: employee.salary - 2000 }))

export const employeeService = { getAll: () => call(() => api.get('/employees'), () => employees), getById: (id) => call(() => api.get(`/employees/${id}`), () => employees.find((item) => item.id === id)) }
export const attendanceService = { getAll: () => call(() => api.get('/attendance/all'), () => attendance) }
export const leaveService = { getAll: () => call(() => api.get('/leaves/all'), () => leaves), approve: (id) => call(() => api.put(`/leaves/${id}/approve`), () => updateLeave(id, 'Approved')), reject: (id, admin_comment) => call(() => api.put(`/leaves/${id}/reject`, { admin_comment }), () => updateLeave(id, 'Rejected', admin_comment)) }
export const payrollService = { getAll: () => call(() => api.get('/payroll/all'), () => payroll), update: (id, payload) => call(() => api.put(`/payroll/${id}`, payload), () => ({ ...payload, employeeId: id, employeeName: employees.find((item) => item.id === id)?.name, netSalary: Number(payload.basicSalary) + Number(payload.allowances) - Number(payload.deductions) })) }
export const dashboardService = { getOverview: async () => { const [employeeResponse, attendanceResponse, leaveResponse, payrollResponse] = await Promise.all([employeeService.getAll(), attendanceService.getAll(), leaveService.getAll(), payrollService.getAll()]); return { employees: employeeResponse.data, attendance: attendanceResponse.data, leaves: leaveResponse.data, payroll: payrollResponse.data } } }
function updateLeave(id, status, admin_comment) { const item = leaves.find((leave) => leave.id === id); if (item) { item.status = status; item.admin_comment = admin_comment }; return item }