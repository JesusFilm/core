import { BookOpen, Lightbulb } from 'lucide-react'
import { ComponentType, ReactElement, SVGProps } from 'react'

export type InteractionType = 'explain' | 'reflect'

interface InteractionStarterProps {
  onSelect: (type: InteractionType, prompt: string) => void
}

const interactions: Array<{
  type: InteractionType
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  prompt: string
}> = [
  {
    type: 'explain',
    label: 'Explain',
    icon: BookOpen,
    prompt: 'Can you explain what this content is about and its significance?'
  },
  {
    type: 'reflect',
    label: 'Reflect',
    icon: Lightbulb,
    prompt:
      'Help me reflect on this content. What are the key takeaways and how can I apply them?'
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
        alignItems: 'center',
        gap: 12,
        padding: '24px 16px 16px'
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: '#9e9e9e',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.4
        }}
      >
        AI may make mistakes.
        <br />
        Please double-check important info.
      </p>
      <p
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1a1a1a',
          margin: 0,
          textAlign: 'center'
        }}
      >
        How would you like to go deeper?
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          justifyContent: 'center'
        }}
      >
        {interactions.map(({ type, label, icon: Icon, prompt }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type, prompt)}
            aria-label={label}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(type, prompt)
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 500,
              borderRadius: 9999,
              border: '1px solid #e0e0e0',
              backgroundColor: 'transparent',
              color: '#333',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            <Icon
              style={{
                width: 20,
                height: 20,
                color: 'var(--color-secondary-light, #6D28D9)'
              }}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
