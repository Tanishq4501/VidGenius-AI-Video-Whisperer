'use client'

import { useState } from 'react'

const ChatInput = ({ onSendMessage, loading, resourcesToggleButton }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('ChatInput: handleSubmit called')
    console.log('ChatInput: message:', message)
    console.log('ChatInput: loading:', loading)
    console.log('ChatInput: message.trim():', message.trim())
    
    if (message.trim() && !loading) {
      console.log('ChatInput: Calling onSendMessage with:', message)
      onSendMessage(message)
      setMessage('')
    } else {
      console.log('ChatInput: Not sending message - conditions not met')
    }
  }

  const handleKeyPress = (e) => {
    console.log('ChatInput: handleKeyPress called, key:', e.key)
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('ChatInput: Enter pressed, calling handleSubmit')
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <div className="flex-1 relative group">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={loading ? "AI is thinking..." : "Ask a follow-up question..."}
            disabled={loading}
            className={`w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 animate-input-focus ${
              message.trim() ? 'border-indigo-300 animate-input-glow' : 'hover:border-gray-300'
            }`}
          />
          <button
            type="button"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-500 transition-all duration-300 rounded-lg hover:bg-indigo-50 ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 384 512">
              <path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/>
            </svg>
          </button>
          {/* Typing indicator dots */}
          {message.trim() && !loading && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-typing-indicator"></div>
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-typing-indicator" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-typing-indicator" style={{animationDelay: '0.4s'}}></div>
            </div>
          )}
        </div>
        
        {/* Resources Toggle Button */}
        {resourcesToggleButton && (
          <div className="flex-shrink-0">
            {resourcesToggleButton}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className={`px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 animate-send-hover ${
            message.trim() && !loading ? 'animate-button-pulse' : ''
          }`}
        >
          <svg className="mr-2 inline w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="white" viewBox="0 0 512 512">
            <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/>
          </svg>
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>
      <div className="flex items-center justify-between mt-3">
                 <div className="flex items-center space-x-2">
           <div className="flex space-x-1">
             <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
             <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
             <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
           </div>
           <p className="text-xs text-gray-500 animate-typing-indicator">
             {loading ? "AI is processing..." : "Press Enter to send"}
           </p>
         </div>
         {message.trim() && (
           <div className="text-xs text-indigo-600 font-medium animate-pulse">
             {message.length} characters
           </div>
         )}
      </div>
    </div>
  )
}

export default ChatInput 