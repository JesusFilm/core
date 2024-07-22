import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface InteractionTextProps {
  heading: string
}

const StyledSpan = styled('span')({
  background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent'
})

export function InteractionText({
  heading
}: InteractionTextProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const text = `${heading} for every `
  return (
    <Trans t={t}>
      <Typography data-testid="InteractionText" variant="h4">
        {text}
        <StyledSpan>interaction</StyledSpan>
      </Typography>
    </Trans>
  )
}
