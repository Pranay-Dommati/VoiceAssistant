import { useState, useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import QuickActions from './QuickActions'
import TextInput from './TextInput'
import StatusBar from './StatusBar'

const API_BASE_URL = 'http://localhost:5000/api'

function VoiceAssistant() {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('Ready')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechSynthesis = useRef(null)

  // Initialize component
  useEffect(() => {
    fetchConfig()
    initializeVoice()
    addMessage("🤖 Assistant: Hello! I'm your voice assistant configured for Hyderabad, India. How can I help you today?", 'assistant')
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isListening])

  // Initialize voice recognition and synthesis
  const initializeVoice = () => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setStatus('Listening...')
      }
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        setStatus('Processing...')
        sendCommand(transcript)
      }
      
      recognitionRef.current.onerror = (event) => {
        setIsListening(false)
        setStatus('Ready')
        console.error('Speech recognition error:', event.error)
        addMessage("🤖 Assistant: Sorry, I couldn't understand that. Please try again.", 'assistant')
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (status === 'Listening...') {
          setStatus('Ready')
        }
      }
      
      setIsVoiceSupported(true)
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis
    }
  }

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening && !isLoading) {
      recognitionRef.current.start()
    }
  }

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  // Speak text using text-to-speech
  const speakText = (text) => {
    if (speechSynthesis.current) {
      // Cancel any ongoing speech
      speechSynthesis.current.cancel()
      
      // Clean the text (remove emojis and assistant prefix)
      const cleanText = text.replace(/🤖 Assistant: /, '').replace(/[^\w\s.,!?]/g, '')
      
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Try to use a female voice
      const voices = speechSynthesis.current.getVoices()
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Karen') ||
        voice.gender === 'female'
      )
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }
      
      speechSynthesis.current.speak(utterance)
    }
  }

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/config`)
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  const addMessage = (content, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      content,
      sender,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendCommand = async (command) => {
    if (!command.trim()) return

    // Add user message
    addMessage(command, 'user')
    setIsLoading(true)
    setStatus('Processing...')

    try {
      const response = await fetch(`${API_BASE_URL}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      })

      const data = await response.json()
      
      if (data.success) {
        const responseMessage = `🤖 Assistant: ${data.response}`
        addMessage(responseMessage, 'assistant')
        // Speak the response
        speakText(responseMessage)
      } else {
        const errorMessage = `🤖 Assistant: ${data.response || 'Sorry, I encountered an error.'}`
        addMessage(errorMessage, 'assistant')
        speakText(errorMessage)
      }
    } catch (error) {
      console.error('API Error:', error)
      const errorMessage = "🤖 Assistant: Sorry, I'm having trouble connecting to my services. Please make sure the backend is running on http://localhost:5000"
      addMessage(errorMessage, 'assistant')
      speakText(errorMessage)
    } finally {
      setIsLoading(false)
      setStatus('Ready')
    }
  }

  const handleQuickAction = async (action) => {
    setIsLoading(true)
    setStatus('Processing...')

    try {
      let response
      switch (action) {
        case 'time':
          response = await fetch(`${API_BASE_URL}/time`)
          break
        case 'weather':
          response = await fetch(`${API_BASE_URL}/weather`)
          break
        case 'news':
          response = await fetch(`${API_BASE_URL}/news`)
          break
        case 'reminders':
          response = await fetch(`${API_BASE_URL}/reminders`)
          break
        default:
          return
      }

      const data = await response.json()
      
      if (data.success) {
        const responseMessage = `🤖 Assistant: ${data.response}`
        addMessage(responseMessage, 'assistant')
        speakText(responseMessage)
      } else {
        const errorMessage = `🤖 Assistant: ${data.response || 'Sorry, I encountered an error.'}`
        addMessage(errorMessage, 'assistant')
        speakText(errorMessage)
      }
    } catch (error) {
      console.error('API Error:', error)
      const errorMessage = "🤖 Assistant: Sorry, I'm having trouble connecting to my services."
      addMessage(errorMessage, 'assistant')
      speakText(errorMessage)
    } finally {
      setIsLoading(false)
      setStatus('Ready')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Voice Assistant</h1>
                <p className="text-blue-200 text-xs">Hyderabad, India</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Voice Button */}
              {isVoiceSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isListening
                      ? 'bg-red-500 border-red-400 animate-pulse'
                      : isLoading
                        ? 'bg-white/10 border-white/20 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 hover:scale-110 hover:shadow-lg'
                  }`}
                >
                  <span className="text-xl">
                    {isListening ? '🔴' : '🎤'}
                  </span>
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
                  )}
                </button>
              )}
              
              <StatusBar status={status} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Full Width Chat Container */}
        <div className="chat-container rounded-2xl h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Conversation</span>
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-blue-200">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Live</span>
                </div>
                {/* Tools Button */}
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  title="Open Tools"
                >
                  <span className="text-sm">⚙️</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scroll">
            {messages.length === 0 && (
              <div className="text-center py-16 animate-fadeInUp">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 glow animate-float">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Welcome to AI Assistant</h3>
                <p className="text-blue-200 text-lg mb-6">I'm here to help you with weather, news, reminders, and more!</p>
                
                {/* Voice Status */}
                {isVoiceSupported ? (
                  <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30 max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-2 text-green-200">
                      <span className="text-xl">🎤</span>
                      <span className="font-medium">Voice input is ready!</span>
                    </div>
                    <p className="text-sm text-green-300 mt-2">Click the microphone button or type your message below</p>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30 max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-2 text-yellow-200">
                      <span className="text-xl">⚠️</span>
                      <span className="font-medium">Voice input not supported</span>
                    </div>
                    <p className="text-sm text-yellow-300 mt-2">Please use the text input below</p>
                  </div>
                )}
                
                {/* Quick Action Chips */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={() => handleQuickAction('time')}
                    className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm"
                  >
                    🕐 Current Time
                  </button>
                  <button 
                    onClick={() => handleQuickAction('weather')}
                    className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm"
                  >
                    🌤️ Weather
                  </button>
                  <button 
                    onClick={() => handleQuickAction('news')}
                    className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm"
                  >
                    📰 News
                  </button>
                  <button 
                    onClick={() => handleQuickAction('reminders')}
                    className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm"
                  >
                    ⏰ Reminders
                  </button>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
              />
            ))}
            
            {isListening && (
              <div className="flex items-center justify-center space-x-4 py-6 bg-blue-500/20 rounded-xl border border-blue-400/30 mx-4 mb-4 animate-pulse">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-blue-200 font-medium">🎤 Listening... Speak now!</span>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center justify-center space-x-4 py-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full typing-dot"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full typing-dot"></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full typing-dot"></div>
                </div>
                <span className="text-blue-200 font-medium">Assistant is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Integrated Input Area */}
          <div className="chat-input-area flex-shrink-0">
            <div className="p-6">
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (input.trim() && !isLoading) { 
                    sendCommand(input.trim()); 
                    setInput(''); 
                  } 
                }} 
                className="flex items-end space-x-4"
              >
                {/* Input Field */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !isLoading) {
                          sendCommand(input.trim());
                          setInput('');
                        }
                      }
                    }}
                    placeholder="Type your message here... or use voice input"
                    className="input-field w-full py-4 px-6 pr-20 rounded-2xl text-white placeholder-white/60 focus:outline-none resize-none auto-resize font-medium text-base leading-relaxed"
                    disabled={isLoading}
                    rows="1"
                    style={{minHeight: '60px', maxHeight: '120px'}}
                  />
                  {/* Character count / hint */}
                  <div className="absolute right-6 bottom-3 text-xs text-white/50 font-medium">
                    {input.length > 0 ? `${input.length} chars` : 'Press Enter ↵ to send'}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {/* Voice Button */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isLoading}
                      className={`voice-button w-16 h-16 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                        isListening
                          ? 'listening'
                          : isLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                      }`}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      <span className="text-2xl relative z-10">
                        {isListening ? '🔴' : '🎤'}
                      </span>
                      {isListening && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping"></div>
                      )}
                    </button>
                  )}
                  
                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`send-button w-16 h-16 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                      !input.trim() || isLoading ? '' : ''
                    }`}
                    title="Send message"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-7 w-7 border-3 border-white/30 border-t-white relative z-10"></div>
                    ) : (
                      <span className="text-2xl relative z-10">🚀</span>
                    )}
                  </button>
                </div>
              </form>
              
              {/* Input Tips */}
              <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-2">
                    <span>💡</span>
                    <span>Try: "What's the weather?" or "Set a reminder"</span>
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  {isVoiceSupported && (
                    <span className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-green-200 font-medium">Voice Ready</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                    <span>⌨️</span>
                    <span className="text-blue-200 font-medium">Shift + Enter for new line</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sliding Tools Panel */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white/10 backdrop-blur-md border-l border-white/20 transform transition-transform duration-300 ease-in-out z-40 tools-panel ${
        showTools ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Tools Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assistant Tools</h3>
              <button
                onClick={() => setShowTools(false)}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <span>✕</span>
              </button>
            </div>
          </div>
          
          {/* Tools Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <QuickActions 
              onAction={handleQuickAction}
              isLoading={isLoading}
            />
            
            {/* Voice Commands Help */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">💡</span>
                <h4 className="font-semibold text-white">Voice Commands</h4>
              </div>
              <div className="text-sm text-blue-200 space-y-2">
                <div>• "What time is it?"</div>
                <div>• "Weather in Mumbai"</div>
                <div>• "Latest news"</div>
                <div>• "Remind me to call mom"</div>
                <div>• "Set a reminder for 5 PM"</div>
              </div>
            </div>
            
            {/* Settings */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">⚙️</span>
                <h4 className="font-semibold text-white">Settings</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Voice Output</span>
                  <button className="w-10 h-6 bg-green-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Auto-scroll</span>
                  <button className="w-10 h-6 bg-green-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when tools panel is open */}
      {showTools && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setShowTools(false)}
        ></div>
      )}
    </div>
  )
}

export default VoiceAssistant
