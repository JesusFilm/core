import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface InteractionTextProps {
  startingText: string
}

const StyledInteractionText = styled('span')({
  background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent'
})

export function InteractionText({
  startingText
}: InteractionTextProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const text = `${startingText} for every `
  return (
    <Typography variant="h4" sx={{ fontWeight: '800' }}>
      {text}
      <StyledInteractionText>{t('interaction')}</StyledInteractionText>
    </Typography>
  )
}
