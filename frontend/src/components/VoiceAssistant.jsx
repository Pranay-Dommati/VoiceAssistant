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
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechSynthesis = useRef(null)

  // Initialize component
  useEffect(() => {
    fetchConfig()
    initializeVoice()
    addMessage("🤖 Assistant: Hello! I'm your voice assistant configured for Hyderabad, India. How can I help you today?", 'assistant')
  }, [])

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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Quick Actions */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-4">
              <QuickActions 
                onAction={handleQuickAction}
                isLoading={isLoading}
              />
              <TextInput 
                onSendMessage={sendCommand}
                isLoading={isLoading}
                onVoiceClick={isListening ? stopListening : startListening}
                isListening={isListening}
                isVoiceSupported={isVoiceSupported}
              />
            </div>
          </div>

          {/* Right - Chat Area */}
          <div className="lg:col-span-2 order-1 lg:order-2 relative">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/20">
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
                    {/* Voice Toggle for Chat */}
                    {isVoiceSupported && (
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-full border transition-all duration-300 ${
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
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="h-96 lg:h-[500px] overflow-y-auto p-6 space-y-4 chat-scroll">
                {messages.length === 0 && (
                  <div className="text-center py-12 animate-fadeInUp">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 glow animate-float">
                      <span className="text-3xl">🤖</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Welcome to AI Assistant</h3>
                    <p className="text-blue-200 mb-4">I'm here to help you with weather, news, reminders, and more!</p>
                    
                    {/* Voice Status */}
                    {isVoiceSupported ? (
                      <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-400/30 max-w-sm mx-auto">
                        <div className="flex items-center justify-center space-x-2 text-green-200">
                          <span>🎤</span>
                          <span className="text-sm font-medium">Voice input is ready!</span>
                        </div>
                        <p className="text-xs text-green-300 mt-1">Click the microphone button to speak</p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30 max-w-sm mx-auto">
                        <div className="flex items-center justify-center space-x-2 text-yellow-200">
                          <span>⚠️</span>
                          <span className="text-sm font-medium">Voice input not supported</span>
                        </div>
                        <p className="text-xs text-yellow-300 mt-1">Please use text input instead</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-white/10 rounded-full text-blue-200">🌤️ Weather</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-purple-200">📰 News</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-pink-200">⏰ Reminders</span>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-cyan-200">🕐 Time</span>
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
                  <div className="flex items-center justify-center space-x-4 py-4 bg-blue-500/20 rounded-lg border border-blue-400/30 mx-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-blue-200 font-medium">🎤 Listening... Speak now!</span>
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex items-center justify-center space-x-4 py-4">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceAssistant
