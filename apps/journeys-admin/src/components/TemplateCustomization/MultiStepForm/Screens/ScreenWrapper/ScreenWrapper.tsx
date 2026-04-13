import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface ScreenWrapperProps {
  title: string
  mobileTitle?: string
  subtitle: string
  mobileSubtitle?: string
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
      alignItems="center"
      data-testid="ScreenWrapper"
      sx={{
        px: { xs: 6, sm: 20 },
        overflow: 'visible'
      }}
    >
      <Stack alignItems="center" sx={{ pb: { xs: 5, sm: 8 } }}>
        <>
          <Typography
            variant="h3"
            display={{ xs: 'none', sm: 'block' }}
            gutterBottom
            sx={{ mb: { xs: 0, sm: 2 } }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            display={{ xs: 'block', sm: 'none' }}
            gutterBottom
            sx={{ mb: { xs: 0, sm: 2 } }}
          >
            {mobileTitle ?? title}
          </Typography>
        </>
        <>
          <Typography
            variant="body1"
            display={{ xs: 'none', sm: 'block' }}
            color="text.secondary"
            align="center"
          >
            {subtitle}
          </Typography>
          <Typography
            variant="body2"
            display={{ xs: 'block', sm: 'none' }}
            color="text.secondary"
            align="center"
            sx={{ whiteSpace: 'pre-line' }}
          >
            {mobileSubtitle ?? subtitle}
          </Typography>
        </>
      </Stack>
      {children}
      {footer}
    </Stack>
  )
}
