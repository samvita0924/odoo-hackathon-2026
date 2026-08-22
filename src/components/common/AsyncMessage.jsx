import ErrorState from './ErrorState.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'
export function LoadingState({ label = 'Loading...' }) { return <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-[#e1e9e4] bg-white text-sm text-[#81908a]"><LoadingSpinner />{label}</div> }
export function AsyncError({ message, onRetry }) { return <div className="space-y-3"><ErrorState message={message} />{onRetry && <button onClick={onRetry} className="text-sm font-bold text-[#6f8d27]">Try again</button>}</div> }