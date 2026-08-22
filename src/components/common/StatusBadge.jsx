import Badge from './Badge.jsx'
const tones = { Present: 'success', Approved: 'success', Pending: 'warning', Rejected: 'error', Absent: 'error', 'Half-day': 'warning', Leave: 'info' }
export default function StatusBadge({ status }) { return <Badge tone={tones[status] || 'neutral'}>{status}</Badge> }