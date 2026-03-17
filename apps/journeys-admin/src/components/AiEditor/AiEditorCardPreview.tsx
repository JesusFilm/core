import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  JourneySimple,
  JourneySimpleCard
} from '@core/shared/ai/journeySimpleTypes'

import { AiState } from './AiChat/AiChat'

interface AiEditorCardPreviewProps {
  journey: JourneySimple
  selectedCardId: string | null
  aiState: AiState
  sx?: SxProps
}

function CardContent({
  card,
  cardIndex
}: {
  card: JourneySimpleCard
  cardIndex: number
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box
      sx={{
        width: 200,
        minHeight: 340,
        borderRadius: 3,
        border: 2,
        borderColor: 'grey.300',
        bgcolor:
          card.backgroundImage != null ? 'grey.900' : 'background.paper',
        p: 2,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflow: 'hidden'
      }}
    >
      {/* Background image overlay */}
      {card.backgroundImage != null && (
        <Box
          component="img"
          src={card.backgroundImage.src}
          alt={card.backgroundImage.alt}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.4
          }}
        />
      )}

      <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1, display: 'block' }}
        >
          {t('Screen {{n}}', { n: cardIndex + 1 })}
        </Typography>

        {card.video != null && (
          <Box sx={{ bgcolor: 'grey.800', borderRadius: 1, p: 1, mb: 1 }}>
            <Typography variant="caption" color="grey.300">
              🎬 {t('Video')}
            </Typography>
          </Box>
        )}

        {card.image != null && (
          <Box
            component="img"
            src={card.image.src}
            alt={card.image.alt}
            sx={{
              width: '100%',
              borderRadius: 1,
              mb: 1,
              maxHeight: 80,
              objectFit: 'cover'
            }}
          />
        )}

        {card.heading != null && (
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              color:
                card.backgroundImage != null ? 'white' : 'text.primary',
              mb: 0.5
            }}
          >
            {card.heading}
          </Typography>
        )}

        {card.text != null && (
          <Typography
            variant="caption"
            sx={{
              color:
                card.backgroundImage != null ? 'grey.300' : 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {card.text}
          </Typography>
        )}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {card.button != null && (
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 1,
              py: 0.5,
              px: 1,
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              mb: 0.5
            }}
          >
            {card.button.text}
          </Box>
        )}

        {card.poll != null && card.poll.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {card.poll.map((option, i) => (
              <Box
                key={i}
                sx={{
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  py: 0.5,
                  px: 1,
                  fontSize: '10px',
                  color:
                    card.backgroundImage != null ? 'white' : 'text.primary'
                }}
              >
                {option.text}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export function AiEditorCardPreview({
  journey,
  selectedCardId,
  aiState,
  sx
}: AiEditorCardPreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const cardIndex = journey.cards.findIndex((c) => c.id === selectedCardId)
  const card = cardIndex >= 0 ? journey.cards[cardIndex] : null
  const isAffected =
    selectedCardId != null &&
    aiState.affectedCardIds.includes(selectedCardId)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
        ...sx
      }}
    >
      {card == null ? (
        <Typography variant="body2" color="text.secondary" align="center">
          {t('Click a screen in the map below to preview it')}
        </Typography>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <CardContent card={card} cardIndex={cardIndex} />
          {isAffected && aiState.status === 'proposal' && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
                fontSize: '9px',
                fontWeight: 700,
                zIndex: 2
              }}
            >
              AI CHANGE
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
