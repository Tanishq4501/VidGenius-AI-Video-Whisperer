'use client'

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user'
  
  // Handle both timestamp (frontend) and created_at (database) fields
  const timeValue = message.timestamp || message.created_at
  const timestamp = new Date(timeValue).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  // Function to format AI message content with lists
  const formatMessageContent = (content) => {
    if (isUser) return content

    // Split content into lines
    const lines = content.split('\n')
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim()
      
      // Check for numbered lists with bold text (1. **text**)
      const numberedBoldMatch = trimmedLine.match(/^(\d+)\.\s+\*\*([^*]+)\*\*$/)
      if (numberedBoldMatch) {
        const number = numberedBoldMatch[1]
        const boldText = numberedBoldMatch[2]
        return (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <span className="text-emerald-500 font-semibold text-sm flex-shrink-0">{number}.</span>
            <span className="text-indigo-500 font-bold">{boldText}</span>
          </div>
        )
      }
      
      // Check for numbered lists (1., 2., 3., etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/)
      if (numberedMatch) {
        const number = numberedMatch[1]
        const text = numberedMatch[2]
        return (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <span className="text-emerald-500 font-semibold text-sm flex-shrink-0">{number}.</span>
            <span className="text-gray-900">{text}</span>
          </div>
        )
      }
      
      // Check for "Point X: Title" format
      const pointMatch = trimmedLine.match(/^\*\*Point\s+(\d+):\s+(.+?)\*\*$/)
      if (pointMatch) {
        const number = pointMatch[1]
        const title = pointMatch[2]
        return (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <span className="text-emerald-500 font-semibold text-sm flex-shrink-0">Point {number}:</span>
            <span className="text-gray-900 font-semibold">{title}</span>
          </div>
        )
      }
      
      // Check for bullet points (-, *, •)
      const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/)
      if (bulletMatch) {
        const text = bulletMatch[1]
        return (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <span className="text-emerald-500 font-semibold text-sm flex-shrink-0">•</span>
            <span className="text-gray-900">{text}</span>
          </div>
        )
      }
      
      // Check for **text** format and make it bold with indigo-500 color
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*[^*]+\*\*)/g)
        const formattedParts = parts.map((part, partIndex) => {
          const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
          if (boldMatch) {
            return (
              <span key={partIndex} className="font-bold text-indigo-500">
                {boldMatch[1]}
              </span>
            )
          }
          return part
        })
        return <div key={index} className="mb-2">{formattedParts}</div>
      }
      
      // Regular text
      return <div key={index} className="mb-2">{trimmedLine}</div>
    })
    
    return formattedLines
  }

  const ASSISTANT_NAME = "ClipBot"; // Creative name for the assistant

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative ${
        isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 animate-brain-pulse' : `bg-emerald-500`
      }`}>
        {isUser ? (
          <>
            <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 448 512">
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
            </svg>
            {/* Sparkle effects around the user avatar */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-sparkle" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute top-1 -left-1 w-1 h-1 bg-purple-400 rounded-full animate-sparkle" style={{animationDelay: '0.6s'}}></div>
          </>
        ) : (
            <svg className="w-4 h-4 svg-inline--fa fa-robot" aria-hidden="true" focusable="false" data-prefix="fas"
                 data-icon="robot" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" data-fa-i2svg="">
                <path fill="white"
                      d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z"></path>
            </svg>
        )}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        {/* Show assistant name above assistant messages */}
        {!isUser && (
          <div className="mb-1 flex items-center space-x-2">
            <div className="relative">
              <span className="text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 px-3 py-1 rounded-full shadow-lg relative overflow-hidden animate-float">
                <span className="relative z-10">{ASSISTANT_NAME}</span>
                {/* Elegant glow effect */}
{/*                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 opacity-60 animate-glow-pulse"></div>
 */}                {/* Elegant sparkle pattern */}
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-elegant-sparkle opacity-80"></div>
                <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-emerald-200 rounded-full animate-elegant-sparkle opacity-60" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-0.5 -left-0.5 w-0.5 h-0.5 bg-emerald-100 rounded-full animate-elegant-sparkle opacity-40" style={{animationDelay: '1s'}}></div>
              </span>
            </div>
          </div>
        )}
        <div className={`rounded-lg px-4 py-3 max-w-md relative ${
                isUser
                    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-tr-none ml-auto text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/20 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-200 ease-out'
                    : 'bg-ai-msg border border-gray-200 rounded-tl-none'
            }`}>
                {/* Cool glow effect for user messages */}
                {isUser && (
                  <>
{/*
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-indigo-400/20 rounded-lg rounded-tr-none blur-sm -z-10 animate-pulse"></div>
*/}
                    {/* Additional sparkle effects around the message bubble */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-sparkle opacity-60"></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-300 rounded-full animate-sparkle opacity-60" style={{animationDelay: '0.4s'}}></div>
                    <div className="absolute top-2 -left-2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-sparkle opacity-60" style={{animationDelay: '0.8s'}}></div>
                    <div className="absolute -top-1 left-1/2 w-1 h-1 bg-pink-300 rounded-full animate-sparkle opacity-60" style={{animationDelay: '1.2s'}}></div>
                  </>
                )}
                
                {isUser ? (
                    <div className="relative z-10">
                        <p className="mr-3 text-sm text-white break-words font-medium leading-relaxed">
                            {message.content}
                        </p>
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-full rounded-full pointer-events-none"></div>
                    </div>
                ) : (
                    <div className="text-sm break-words">
                        {formatMessageContent(message.content)}
                    </div>
                )}
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>{timestamp}</p>
        </div>
    </div>
  )
}

export default ChatMessage 