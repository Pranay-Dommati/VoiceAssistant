import { FaClock, FaCloudSun, FaNewspaper, FaBell, FaBolt } from 'react-icons/fa'

function QuickActions({ onAction, isLoading }) {
  const actions = [
    { 
      id: 'time', 
      label: 'Current Time', 
      icon: FaClock, 
      description: 'Get current time and date',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'weather', 
      label: 'Weather Update', 
      icon: FaCloudSun, 
      description: 'Weather in Hyderabad',
      color: 'from-cyan-500 to-blue-500'
    },
    { 
      id: 'news', 
      label: 'Latest News', 
      icon: FaNewspaper, 
      description: 'Headlines from India',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'reminders', 
      label: 'My Reminders', 
      icon: FaBell, 
      description: 'Show upcoming reminders',
      color: 'from-pink-500 to-rose-500'
    },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
          <FaBolt className="text-white text-xs" />
        </div>
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={isLoading}
            className={`group text-left p-3 rounded-lg border transition-all duration-300 ${
              isLoading
                ? 'border-white/10 bg-white/5 text-white/50 cursor-not-allowed'
                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white hover:scale-105'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="text-sm text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm group-hover:text-blue-200 transition-colors">
                  {action.label}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-white/20">
        <div className="flex items-center space-x-2 mb-2">
          <FaBolt className="text-sm text-yellow-400" />
          <h4 className="font-semibold text-white text-sm">Voice Commands</h4>
        </div>
        <div className="text-xs text-blue-200 space-y-1">
          <div>• "What time is it?"</div>
          <div>• "Weather in Mumbai"</div>
          <div>• "Latest news"</div>
          <div>• "Remind me to call mom"</div>
        </div>
      </div>
    </div>
  )
}

export default QuickActions
