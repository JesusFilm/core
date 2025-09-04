import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import { Suggestion, SuggestionsRequest, SuggestionsResponse } from '../../types/suggestions'
import { useBlocks } from '@core/journeys/ui/block'
import { extractTypographyContent } from '../../utils/contextExtraction'

type AiChatProps = {
  open: boolean
}

export function AiChat({ open }: AiChatProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  })
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const { treeBlocks, blockHistory } = useBlocks()

  // Fetch suggestions when the chat opens
  useEffect(() => {
    if (!open) return
    const activeBlock = blockHistory.at(-1)
    if (!activeBlock) {
      console.log('No blocks found for suggestions')
      setSuggestions([])
      return
    }

    let isCancelled = false

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true)
      setSuggestionsError(null)

      try {
        const contextText = extractTypographyContent(activeBlock)
        if (!contextText) {
          console.log('No suggestions generated')
          setSuggestions([])
          return
        }

        const requestBody: SuggestionsRequest = { contextText }
        const response = await fetch('/api/chat/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) throw new Error('Failed to fetch suggestions')

        const data: SuggestionsResponse = await response.json()
        const suggestionsWithIds = data.suggestions.map((text: string, index: number) => ({
          id: `suggestion-${index}`,
          text
        }))
        if (!isCancelled) setSuggestions(suggestionsWithIds)
      } catch (error) {
        if (isCancelled) return
        console.error('Error fetching suggestions:', error)
        setSuggestionsError('Failed to load suggestions')
        setSuggestions([])
      } finally {
        if (!isCancelled) setSuggestionsLoading(false)
      }
    }

    fetchSuggestions()
    return () => {
      isCancelled = true
    }
  }, [open, treeBlocks])

  // Prototype visibility
  useEffect(() => {
    suggestions.forEach(element => {
      console.log("Suggestion: ", element.text)
    });
  }, [suggestions])

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) return
          sendMessage({ text: input })
          setInput('')
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== 'ready'}>
          Submit
        </button>
      </form>
    </>
  )
}
