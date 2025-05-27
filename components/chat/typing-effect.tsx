// components/chat/typing-effect.tsx

"use client"

import React, { useState, useEffect } from "react"

interface TypingEffectProps {
  content: string
  speed?: number // Milliseconds per character
  onComplete?: () => void
}

export const TypingEffect = ({ 
  content, 
  speed = 15, 
  onComplete 
}: TypingEffectProps) => {
  const [displayedContent, setDisplayedContent] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    // Reset when content changes
    setDisplayedContent("")
    setIsComplete(false)
    
    let index = 0
    const timer = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent((prev) => prev + content.charAt(index))
        index++
      } else {
        clearInterval(timer)
        setIsComplete(true)
        if (onComplete) onComplete()
      }
    }, speed)
    
    return () => clearInterval(timer)
  }, [content, speed, onComplete])
  
  return (
    <div className="whitespace-pre-wrap">
      {displayedContent}
      {!isComplete && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse"></span>}
    </div>
  )
}

// A hook to track whether to apply typing effect
export const useTypingEffect = (initialState = true) => {
  const [useTyping, setUseTyping] = useState(initialState)
  
  // Get the setting from localStorage when component mounts
  useEffect(() => {
    const savedPreference = localStorage.getItem('useTypingEffect')
    if (savedPreference !== null) {
      setUseTyping(savedPreference === 'true')
    }
  }, [])
  
  // Save the preference to localStorage when it changes
  const toggleTypingEffect = () => {
    const newValue = !useTyping
    setUseTyping(newValue)
    localStorage.setItem('useTypingEffect', newValue.toString())
  }
  
  return { useTyping, toggleTypingEffect }
}