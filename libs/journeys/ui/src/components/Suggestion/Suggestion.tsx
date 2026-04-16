import { ReactElement } from 'react'

import { SimpleButton } from '../SimpleButton'

interface SuggestionProps {
  label: string
  onClick: () => void
}

export function Suggestion({ label, onClick }: SuggestionProps): ReactElement {
  return (
    <SimpleButton
      variant="secondary"
      size="sm"
      onClick={onClick}
      style={{
        borderRadius: 16,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </SimpleButton>
  )
}

interface SuggestionsListProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export function SuggestionsList({
  suggestions,
  onSelect
}: SuggestionsListProps): ReactElement {
  if (suggestions.length === 0) return <></>

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '8px 16px',
        overflowX: 'auto',
        flexWrap: 'nowrap'
      }}
    >
      {suggestions.map((suggestion) => (
        <Suggestion
          key={suggestion}
          label={suggestion}
          onClick={() => onSelect(suggestion)}
        />
      ))}
    </div>
  )
}
