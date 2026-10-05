import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface ScreenWrapperProps {
  title: string
  mobileTitle?: string
  subtitle: string
  mobileSubtitle?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/**
 * Wraps a multi-step form screen with a responsive title, subtitle, and optional footer.
 *
 * @param title - The heading displayed on desktop viewports.
 * @param mobileTitle - Optional heading override for mobile viewports. Falls back to `title`.
 * @param subtitle - The subheading displayed on desktop viewports.
 * @param mobileSubtitle - Optional subheading override for mobile viewports. Falls back to `subtitle`.
 * @param footer - Optional content rendered below the children.
 * @param children - The main screen content.
 */
export function ScreenWrapper({
  title,
  mobileTitle,
  subtitle,
  mobileSubtitle,
  footer,
  children
}: ScreenWrapperProps): ReactElement {
  return (
    <Stack
      data-testid="ScreenWrapper"
      sx={{
        alignItems: 'center',
        px: { xs: 6, sm: 20 },
        overflow: 'visible'
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          pb: { xs: 5, sm: 8 }
        }}
      >
        <Box aria-label="title">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              display: { xs: 'none', sm: 'block' },
              mb: { xs: 0, sm: 2 }
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              display: { xs: 'block', sm: 'none' },
              mb: { xs: 0, sm: 2 }
            }}
          >
            {mobileTitle ?? title}
          </Typography>
        </Box>
        <Box aria-label="subtitle">
          <Typography
            variant="body1"
            align="center"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'text.secondary'
            }}
          >
            {subtitle}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              display: { xs: 'block', sm: 'none' },
              color: 'text.secondary'
            }}
          >
            {mobileSubtitle ?? subtitle}
          </Typography>
        </Box>
      </Stack>
      {children}
      {footer}
    </Stack>
  )
}
