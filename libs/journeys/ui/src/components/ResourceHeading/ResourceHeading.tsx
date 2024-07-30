import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface ResourceHeadingProps {
  heading: string
}

const StyledSpan = styled('span')({
  background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent'
})

export function ResourceHeading({
  heading
}: ResourceHeadingProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Trans t={t}>
      <Typography variant="h4">
        {`${heading} for every `}
        <StyledSpan>interaction</StyledSpan>
      </Typography>
    </Trans>
  )
}
