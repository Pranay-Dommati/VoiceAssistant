import { useState, useEffect } from 'react'

function StatusBar({ status, isLoading }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getStatusColor = () => {
    if (isLoading) return 'text-yellow-400'
    if (status === 'Ready') return 'text-green-400'
    return 'text-blue-400'
  }

  const getStatusIcon = () => {
    if (isLoading) return '🔄'
    if (status === 'Ready') return '●'
    return '●'
  }

  return (
    <div className="flex items-center space-x-6">
      {/* Status */}
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-sm border ${
        isLoading 
          ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200' 
          : status === 'Ready' 
            ? 'bg-green-500/20 border-green-400/30 text-green-200'
            : 'bg-blue-500/20 border-blue-400/30 text-blue-200'
      }`}>
        <span className={`text-sm ${isLoading ? 'animate-spin' : 'animate-pulse'}`}>
          {getStatusIcon()}
        </span>
        <span className="font-medium text-sm">{status}</span>
      </div>
      
      {/* Time */}
      <div className="flex items-center space-x-2 text-white/80">
        <span className="text-sm">🕐</span>
        <span className="font-mono text-sm">
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      </div>
      
      {/* Location */}
      <div className="hidden md:flex items-center space-x-2 text-white/60">
        <span className="text-sm">📍</span>
        <span className="text-sm">Hyderabad, IN</span>
      </div>
    </div>
  )
}

export default StatusBar
