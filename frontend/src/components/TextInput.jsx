import { useState } from 'react'

function TextInput({ onSendMessage, isLoading, onVoiceClick, isListening, isVoiceSupported }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-xl">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-md flex items-center justify-center">
          <span className="text-white text-xs">💭</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Send Message</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... Try 'What's the weather?' or 'Remind me to call mom'"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/10 resize-none transition-all duration-200 backdrop-blur-sm text-sm"
            rows="3"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-white/40">
            Press Enter to send
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              !input.trim() || isLoading
                ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-white/20'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Send</span>
                <span>🚀</span>
              </div>
            )}
          </button>
          
          {/* Voice Button */}
          {isVoiceSupported && (
            <button
              type="button"
              onClick={onVoiceClick}
              disabled={isLoading}
              className={`w-12 h-8 rounded-lg border transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 border-red-400 animate-pulse'
                  : isLoading
                    ? 'bg-white/10 border-white/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 hover:scale-110'
              }`}
            >
              <span className="text-sm">
                {isListening ? '🔴' : '🎤'}
              </span>
            </button>
          )}
        </div>
      </form>
      
      <div className="mt-3 p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg border border-white/20">
        <div className="flex items-center space-x-1 mb-1">
          <span className="text-sm">✨</span>
          <h4 className="font-semibold text-white text-xs">Pro Tips</h4>
        </div>
        <div className="text-xs text-emerald-200 space-y-1">
          <div>• Use natural language for better understanding</div>
          <div>• Try "Weather in Mumbai" or "Remind me in 10 minutes"</div>
          {isVoiceSupported && (
            <div className="flex items-center space-x-1 text-green-200">
              <span>🎤</span>
              <span>• Click the microphone to use voice input</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TextInput
