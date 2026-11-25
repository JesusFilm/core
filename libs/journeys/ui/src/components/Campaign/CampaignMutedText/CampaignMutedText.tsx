import Typography, { TypographyProps } from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface CampaignMutedTextProps {
  variant?: TypographyProps['variant']
  /** The element to render; the variant's own by default. */
  component?: 'p' | 'span'
  'data-testid'?: string
  children: ReactNode
}

/** Secondary body text in the band's muted colour, keeping its authored line breaks. */
export function CampaignMutedText({
  variant = 'body1',
  component,
  'data-testid': testId,
  children
}: CampaignMutedTextProps): ReactElement {
  return (
    <Typography
      variant={variant}
      {...(component != null ? { component } : {})}
      data-testid={testId}
      sx={{ color: 'var(--campaign-band-muted)', whiteSpace: 'pre-line' }}
    >
      {children}
    </Typography>
  )
}
