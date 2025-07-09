function ChatMessage({ message }) {
  const isAssistant = message.sender === 'assistant'
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start animate-slideInLeft' : 'justify-end animate-slideInRight'} mb-4`}>
      <div className={`flex ${isAssistant ? 'flex-row' : 'flex-row-reverse'} items-start space-x-2 max-w-3xl`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isAssistant 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }`}>
          <span className="text-white text-sm">
            {isAssistant ? '🤖' : '👤'}
          </span>
        </div>
        
        {/* Message */}
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1`}>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${
              isAssistant ? 'text-blue-200' : 'text-emerald-200'
            }`}>
              {isAssistant ? 'AI Assistant' : 'You'}
            </span>
            <span className="text-xs text-white/40">
              {message.timestamp}
            </span>
          </div>
          
          <div className={`relative px-3 py-2 rounded-lg max-w-lg shadow-lg transition-all duration-300 ${
            isAssistant 
              ? 'bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
          }`}>
            <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
              {message.content.replace('🤖 Assistant: ', '')}
            </div>
            
            {/* Message tail */}
            <div className={`absolute w-2 h-2 transform rotate-45 ${
              isAssistant 
                ? '-left-1 top-3 bg-white/15 border-l border-b border-white/20' 
                : '-right-1 top-3 bg-gradient-to-br from-green-600 to-emerald-600'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
