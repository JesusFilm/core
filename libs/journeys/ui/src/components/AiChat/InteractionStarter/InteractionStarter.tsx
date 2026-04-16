import { ReactElement } from 'react'

import { SimpleButton } from '../../SimpleButton'

export type InteractionType = 'explain' | 'reflect' | 'question'

interface InteractionStarterProps {
  onSelect: (type: InteractionType, prompt: string) => void
}

const interactions: Array<{
  type: InteractionType
  label: string
  prompt: string
}> = [
  {
    type: 'explain',
    label: 'Explain this',
    prompt: 'Can you explain what this content is about and its significance?'
  },
  {
    type: 'reflect',
    label: 'Help me reflect',
    prompt:
      'Help me reflect on this content. What are the key takeaways and how can I apply them?'
  },
  {
    type: 'question',
    label: 'I have a question',
    prompt: 'I have a question about what I just read.'
  }
]

export function InteractionStarter({
  onSelect
}: InteractionStarterProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px'
      }}
    >
      <p
        style={{
          fontSize: 14,
          color: '#666',
          margin: '0 0 8px',
          textAlign: 'center'
        }}
      >
        How can I help you today?
      </p>
      {interactions.map(({ type, label, prompt }) => (
        <SimpleButton
          key={type}
          variant="secondary"
          size="md"
          onClick={() => onSelect(type, prompt)}
          style={{ width: '100%' }}
        >
          {label}
        </SimpleButton>
      ))}
    </div>
  )
}
