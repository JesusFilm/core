import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { ReactElement, useState } from 'react'

import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import { AiState } from './AiChat/AiChat'
import { AiEditorCardPreview } from './AiEditorCardPreview'
import { AiEditorFlowMap } from './AiEditorFlowMap'

interface AiEditorPreviewProps {
  journey: JourneySimple
  aiState: AiState
  onSelectedCardChange: (cardId: string | null) => void
  sx?: SxProps
}

export function AiEditorPreview({
  journey,
  aiState,
  onSelectedCardChange,
  sx
}: AiEditorPreviewProps): ReactElement {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  function handleCardSelect(cardId: string): void {
    const next = selectedCardId === cardId ? null : cardId
    setSelectedCardId(next)
    onSelectedCardChange(next)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ...sx
      }}
    >
      <AiEditorCardPreview
        journey={journey}
        selectedCardId={selectedCardId}
        aiState={aiState}
        sx={{ height: '50%' }}
      />
      <AiEditorFlowMap
        journey={journey}
        selectedCardId={selectedCardId}
        aiState={aiState}
        onCardSelect={handleCardSelect}
        sx={{ height: '50%' }}
      />
    </Box>
  )
}
