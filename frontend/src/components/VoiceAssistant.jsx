import { useState, useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import QuickActions from './QuickActions'
import TextInput from './TextInput'
import StatusBar from './StatusBar'
import { 
  FaRobot, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaPaperPlane, 
  FaCog, 
  FaTimes, 
  FaClock, 
  FaCloudSun, 
  FaNewspaper, 
  FaBell,
  FaLightbulb,
  FaKeyboard,
  FaVolumeUp,
  FaChevronUp,
  FaCircle,
  FaPlus,
  FaCalendarAlt,
  FaArrowLeft,
  FaTrash,
  FaEdit,
  FaCheck,
  FaEye
} from 'react-icons/fa'

const API_BASE_URL = 'http://localhost:5000/api'

function VoiceAssistant() {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('Ready')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [activeToolView, setActiveToolView] = useState('main') // 'main', 'reminders'
  const [input, setInput] = useState('')
  const [reminderInput, setReminderInput] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminders, setReminders] = useState([])
  const [editingReminder, setEditingReminder] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechSynthesis = useRef(null)

  // Initialize component
  useEffect(() => {
    if (!isInitialized) {
      fetchConfig()
      initializeVoice()
      fetchReminders() // Fetch reminders on initial load
      setIsInitialized(true)
      
      // Add initial message only once, after a short delay
      setTimeout(() => {
        setMessages(prev => {
          // Check if initial message already exists
          const hasInitialMessage = prev.some(msg => 
            msg.sender === 'assistant' && msg.content.includes("Hello! I'm your AI voice assistant")
          )
          
          if (!hasInitialMessage) {
            return [...prev, {
              id: Date.now(),
              content: "🤖 Assistant: Hello! I'm your AI voice assistant. I can help you with weather for any city, news, reminders, and more. How can I help you today?",
              sender: 'assistant',
              timestamp: new Date().toLocaleTimeString()
            }]
          }
          
          return prev
        })
      }, 100)
    }
  }, [isInitialized])

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
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis
      
      // Stop any ongoing speech when component initializes
      speechSynthesis.current.cancel()
      setIsSpeaking(false)
    }
    
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
  }

  // Stop speech synthesis
  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel()
      setIsSpeaking(false)
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
      
      // Set speaking state
      setIsSpeaking(true)
      
      // Handle speech events
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
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
    // Prevent duplicate initial messages
    if (sender === 'assistant' && content.includes("Hello! I'm your AI voice assistant")) {
      // Check if this message already exists
      const existingMessage = messages.find(msg => 
        msg.sender === 'assistant' && msg.content.includes("Hello! I'm your AI voice assistant")
      )
      if (existingMessage) {
        return // Don't add duplicate
      }
    }
    
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
        
        // Check if this was a reminder command and refresh the reminders list
        if (data.data && (data.data.text || data.data.reminder_incomplete)) {
          await fetchReminders()
        }
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
    if (action === 'reminders') {
      // Open the reminders panel and fetch reminders
      setActiveToolView('reminders')
      setShowTools(true)
      await fetchReminders()
      return
    }

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

  const handleCreateReminder = async () => {
    if (!reminderInput.trim()) return

    // Create the reminder command
    let command = `remind me to ${reminderInput.trim()}`
    
    if (reminderTime) {
      command += ` at ${reminderTime}`
    }
    
    if (reminderDate) {
      command += ` on ${reminderDate}`
    }
    
    // Send the command to the assistant
    await sendCommand(command)
    
    // Clear the form
    setReminderInput('')
    setReminderTime('')
    setReminderDate('')
    
    // Refresh the reminders list
    await fetchReminders()
  }

  const fetchReminders = async () => {
    try {
      console.log('Fetching reminders...')
      const response = await fetch(`${API_BASE_URL}/reminders`)
      console.log('Fetch reminders response status:', response.status)
      
      const data = await response.json()
      console.log('Fetch reminders data:', data)
      
      if (data.success) {
        setReminders(data.data || [])
        console.log('Updated reminders state:', data.data)
      } else {
        console.error('Failed to fetch reminders:', data.error)
        setReminders([])
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
      setReminders([])
    }
  }

  const handleGetReminders = async () => {
    setIsLoading(true)
    setStatus('Getting reminders...')

    try {
      const response = await fetch(`${API_BASE_URL}/reminders`)
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

  const handleDeleteReminder = async (reminderId) => {
    try {
      console.log('Deleting reminder with ID:', reminderId)
      const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}`, {
        method: 'DELETE'
      })
      
      console.log('Delete response status:', response.status)
      const data = await response.json()
      console.log('Delete response data:', data)
      
      if (response.ok && data.success) {
        // Remove from local state
        setReminders(prev => prev.filter(r => r.id !== reminderId))
        addMessage(`🤖 Assistant: ${data.response}`, 'assistant')
        // Refresh the reminders list
        await fetchReminders()
      } else {
        addMessage(`🤖 Assistant: ${data.response || 'Failed to delete reminder.'}`, 'assistant')
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
      addMessage(`🤖 Assistant: Error deleting reminder: ${error.message}`, 'assistant')
    }
  }

  const handleClearAllReminders = async () => {
    try {
      console.log('Clearing all reminders')
      const response = await fetch(`${API_BASE_URL}/reminders/clear`, {
        method: 'DELETE'
      })
      
      console.log('Clear all response status:', response.status)
      const data = await response.json()
      console.log('Clear all response data:', data)
      
      if (response.ok && data.success) {
        // Clear local state
        setReminders([])
        addMessage(`🤖 Assistant: ${data.response}`, 'assistant')
        // Refresh the reminders list
        await fetchReminders()
      } else {
        addMessage(`🤖 Assistant: ${data.response || 'Failed to clear reminders.'}`, 'assistant')
      }
    } catch (error) {
      console.error('Error clearing reminders:', error)
      addMessage(`🤖 Assistant: Error clearing reminders: ${error.message}`, 'assistant')
    }
  }

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder)
    setReminderInput(reminder.text)
    // Convert ISO time to input format
    const reminderTime = new Date(reminder.time)
    setReminderTime(reminderTime.toTimeString().slice(0, 5))
    setReminderDate(reminderTime.toISOString().split('T')[0])
  }

  const handleUpdateReminder = async () => {
    if (!editingReminder || !reminderInput.trim()) return

    try {
      const reminderDateTime = new Date()
      if (reminderDate) {
        const [year, month, day] = reminderDate.split('-')
        reminderDateTime.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      if (reminderTime) {
        const [hours, minutes] = reminderTime.split(':')
        reminderDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      console.log('Updating reminder:', {
        id: editingReminder.id,
        text: reminderInput,
        time: reminderDateTime.toISOString()
      })

      const response = await fetch(`${API_BASE_URL}/reminders/${editingReminder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: reminderInput,
          time: reminderDateTime.toISOString()
        })
      })

      console.log('Update response status:', response.status)
      const data = await response.json()
      console.log('Update response data:', data)

      if (response.ok && data.success) {
        // Update local state
        setReminders(prev => prev.map(r => 
          r.id === editingReminder.id 
            ? { ...r, text: reminderInput, time: reminderDateTime.toISOString() }
            : r
        ))
        setEditingReminder(null)
        setReminderInput('')
        setReminderTime('')
        setReminderDate('')
        addMessage(`🤖 Assistant: ${data.response}`, 'assistant')
        // Refresh the reminders list
        await fetchReminders()
      } else {
        addMessage(`🤖 Assistant: ${data.response || 'Failed to update reminder.'}`, 'assistant')
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
      addMessage(`🤖 Assistant: Error updating reminder: ${error.message}`, 'assistant')
    }
  }

  const handleToolsClose = () => {
    setShowTools(false)
    setActiveToolView('main')
  }

  // Fetch reminders when reminder panel opens
  useEffect(() => {
    if (activeToolView === 'reminders') {
      fetchReminders()
    }
  }, [activeToolView])

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel()
      }
    }
  }, [])

  // Add keyboard shortcut to stop speech (Escape key)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isSpeaking) {
        stopSpeaking()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSpeaking])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 flex-shrink-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaRobot className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Voice Assistant</h1>
                <p className="text-blue-200 text-xs">Global assistant for weather, news & more</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Stop Speech Button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 border-2 border-red-400 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-lg animate-pulse"
                  title="Stop speaking"
                >
                  <FaVolumeUp className="text-xl text-white" />
                  <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
                </button>
              )}
              
              {/* Voice Button */}
              {isVoiceSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isListening
                      ? 'bg-red-500 border-red-400 animate-pulse'
                      : isLoading
                        ? 'bg-white/10 border-white/20 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 hover:scale-110 hover:shadow-lg'
                  }`}
                >
                  {isListening ? (
                    <FaMicrophoneSlash className="text-xl text-white" />
                  ) : (
                    <FaMicrophone className="text-xl text-white" />
                  )}
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

      {/* Main Content - Full Screen Chat */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Chat Container - Full Screen */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm min-h-0">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <FaCircle className="text-xs text-green-400 animate-pulse" />
                <span>Conversation</span>
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-blue-200">
                  <FaCircle className="text-xs text-blue-400" />
                  <span>Live</span>
                </div>
                {/* Tools Button */}
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  title="Open Tools"
                >
                  <FaCog className="text-sm text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto chat-scroll min-h-0">
            <div className="max-w-4xl mx-auto px-6 py-6 space-y-4 min-h-full">
              {messages.length === 0 && (
                <div className="text-center py-16 animate-fadeInUp">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 glow animate-float">
                    <FaRobot className="text-4xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Welcome to AI Assistant</h3>
                  <p className="text-blue-200 text-lg mb-6">I can help you with weather for any city, news, reminders, and more!</p>
                  
                  {/* Voice Status */}
                  {isVoiceSupported ? (
                    <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30 max-w-md mx-auto">
                      <div className="flex items-center justify-center space-x-2 text-green-200">
                        <FaMicrophone className="text-xl" />
                        <span className="font-medium">Voice input is ready!</span>
                      </div>
                      <p className="text-sm text-green-300 mt-2">Click the microphone button or type your message below</p>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30 max-w-md mx-auto">
                      <div className="flex items-center justify-center space-x-2 text-yellow-200">
                        <FaMicrophoneSlash className="text-xl" />
                        <span className="font-medium">Voice input not supported</span>
                      </div>
                      <p className="text-sm text-yellow-300 mt-2">Please use the text input below</p>
                    </div>
                  )}
                  
                  {/* Quick Action Chips */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <button 
                      onClick={() => handleQuickAction('time')}
                      className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm flex items-center space-x-2"
                    >
                      <FaClock />
                      <span>Current Time</span>
                    </button>
                    <button 
                      onClick={() => handleQuickAction('weather')}
                      className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm flex items-center space-x-2"
                    >
                      <FaCloudSun />
                      <span>Weather</span>
                    </button>
                    <button 
                      onClick={() => handleQuickAction('news')}
                      className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm flex items-center space-x-2"
                    >
                      <FaNewspaper />
                      <span>News</span>
                    </button>
                    <button 
                      onClick={() => handleQuickAction('reminders')}
                      className="quick-chip px-4 py-2 rounded-full text-blue-200 text-sm flex items-center space-x-2"
                    >
                      <FaBell />
                      <span>Reminders</span>
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
              
              {isSpeaking && (
                <div className="flex items-center justify-center space-x-4 py-6 bg-red-500/20 rounded-xl border border-red-400/30 animate-pulse max-w-md mx-auto">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-red-200 font-medium flex items-center space-x-2">
                    <FaVolumeUp />
                    <span>Speaking...</span>
                  </span>
                  <button
                    onClick={stopSpeaking}
                    className="px-3 py-1 bg-red-500/30 border border-red-400/50 rounded-lg text-red-200 text-sm hover:bg-red-500/50 transition-all duration-200"
                  >
                    Stop
                  </button>
                </div>
              )}
              
              {isListening && (
                <div className="flex items-center justify-center space-x-4 py-6 bg-blue-500/20 rounded-xl border border-blue-400/30 animate-pulse max-w-md mx-auto">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-blue-200 font-medium flex items-center space-x-2">
                    <FaMicrophone />
                    <span>Listening... Speak now!</span>
                  </span>
                </div>
              )}
              
              {isLoading && (
                <div className="flex items-center justify-center space-x-4 py-6 max-w-md mx-auto">
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

          {/* Integrated Input Area - Fixed at Bottom */}
          <div className="chat-input-area flex-shrink-0 border-t border-white/10">
            <div className="max-w-4xl mx-auto px-6 py-6">
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
                  {/* Stop Speech Button */}
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 border-2 border-red-400 rounded-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 animate-pulse"
                      title="Stop speaking"
                    >
                      <FaVolumeUp className="text-2xl text-white relative z-10" />
                      <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping"></div>
                    </button>
                  )}
                  
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
                      {isListening ? (
                        <FaMicrophoneSlash className="text-2xl text-white relative z-10" />
                      ) : (
                        <FaMicrophone className="text-2xl text-white relative z-10" />
                      )}
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
                      <FaPaperPlane className="text-2xl text-white relative z-10" />
                    )}
                  </button>
                </div>
              </form>
              
              {/* Input Tips */}
              <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-2">
                    <FaLightbulb />
                    <span>Try: "Weather in Tokyo" or "Set a reminder"</span>
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center space-x-2 text-red-300">
                      <FaVolumeUp />
                      <span>Press Escape to stop speech</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  {isVoiceSupported && (
                    <span className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                      <FaCircle className="text-green-400 animate-pulse" style={{fontSize: '8px'}} />
                      <span className="text-green-200 font-medium">Voice Ready</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                    <FaKeyboard />
                    <span className="text-blue-200 font-medium">Shift + Enter for new line</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sliding Tools Panel */}
      <div className={`fixed top-20 bottom-0 right-0 w-96 bg-white/10 backdrop-blur-md border-l border-white/20 transform transition-transform duration-300 ease-in-out z-40 tools-panel ${
        showTools ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Tools Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {activeToolView === 'reminders' && (
                  <button
                    onClick={() => setActiveToolView('main')}
                    className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 mr-2"
                  >
                    <FaArrowLeft className="text-white text-sm" />
                  </button>
                )}
                <h3 className="text-lg font-semibold text-white">
                  {activeToolView === 'reminders' ? 'Reminder Manager' : 'Assistant Tools'}
                </h3>
              </div>
              <button
                onClick={handleToolsClose}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          </div>
          
          {/* Tools Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeToolView === 'main' ? (
              <>
                <QuickActions 
                  onAction={handleQuickAction}
                  isLoading={isLoading}
                />
                
                {/* Voice Commands Help */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FaLightbulb className="text-lg text-yellow-400" />
                    <h4 className="font-semibold text-white">Voice Commands</h4>
                  </div>
                  <div className="text-sm text-blue-200 space-y-2">
                    <div>• "What time is it?"</div>
                    <div>• "Weather in Mumbai" / "London weather"</div>
                    <div>• "Temperature in Dubai"</div>
                    <div>• "Latest news" / "Technology news"</div>
                    <div>• "Remind me to call mom"</div>
                    <div>• "Set a reminder for 5 PM"</div>
                  </div>
                </div>
                
                {/* Settings */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FaCog className="text-lg text-gray-400" />
                    <h4 className="font-semibold text-white">Settings</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white flex items-center space-x-2">
                        <FaVolumeUp className="text-blue-400" />
                        <span>Voice Output</span>
                      </span>
                      <button className="w-10 h-6 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white flex items-center space-x-2">
                        <FaChevronUp className="text-blue-400" />
                        <span>Auto-scroll</span>
                      </span>
                      <button className="w-10 h-6 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Reminder Management Interface */
              <div className="space-y-4">
                {/* Create New Reminder */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    {editingReminder ? (
                      <FaEdit className="text-lg text-blue-400" />
                    ) : (
                      <FaPlus className="text-lg text-green-400" />
                    )}
                    <h4 className="font-semibold text-white">
                      {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Reminder Text */}
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
                        What should I remind you about?
                      </label>
                      <input
                        type="text"
                        value={reminderInput}
                        onChange={(e) => setReminderInput(e.target.value)}
                        placeholder="e.g., call mom, meeting with team, buy groceries"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    {/* Time and Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          <FaClock className="inline mr-1" />
                          Time (optional)
                        </label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          <FaCalendarAlt className="inline mr-1" />
                          Date (optional)
                        </label>
                        <input
                          type="date"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={editingReminder ? handleUpdateReminder : handleCreateReminder}
                        disabled={!reminderInput.trim() || isLoading}
                        className={`flex-1 ${
                          editingReminder 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        } text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2`}
                      >
                        <FaCheck />
                        <span>{editingReminder ? 'Update Reminder' : 'Create Reminder'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingReminder(null)
                          setReminderInput('')
                          setReminderTime('')
                          setReminderDate('')
                        }}
                        className="bg-white/10 border border-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* My Reminders */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FaBell className="text-lg text-yellow-400" />
                      <h4 className="font-semibold text-white">My Reminders</h4>
                    </div>
                    {reminders.length > 0 && (
                      <button
                        onClick={handleClearAllReminders}
                        className="px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-lg text-red-400 text-xs hover:bg-red-500/30 transition-all duration-200"
                        title="Clear all reminders"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {reminders.length === 0 ? (
                    <div className="text-center py-8">
                      <FaBell className="text-4xl text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No reminders yet</p>
                      <p className="text-white/40 text-xs mt-1">Create your first reminder above</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reminders.map((reminder) => (
                        <div key={reminder.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{reminder.text}</p>
                              <p className="text-blue-200 text-xs mt-1">{reminder.formatted_time}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <button
                                onClick={() => handleEditReminder(reminder)}
                                className="w-7 h-7 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-all duration-200"
                                title="Edit reminder"
                              >
                                <FaEdit className="text-xs text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="w-7 h-7 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-all duration-200"
                                title="Delete reminder"
                              >
                                <FaTrash className="text-xs text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Voice Command Tips */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-white/20 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FaLightbulb className="text-lg text-yellow-400" />
                    <h4 className="font-semibold text-white">Voice Command Examples</h4>
                  </div>
                  <div className="text-sm text-blue-200 space-y-2">
                    <div>• "Remind me to call mom in 30 minutes"</div>
                    <div>• "Set a reminder for 3 PM today"</div>
                    <div>• "Remind me to buy groceries tomorrow"</div>
                    <div>• "Set a reminder for the meeting at 2 PM"</div>
                  </div>
                </div>
              </div>
            )}
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
