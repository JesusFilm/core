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
      sx={{ border: '1px solid red',
        px: { xs: 6, sm: 20 },
         overflow: 'visible'
       }}
    >
      <Stack alignItems="center" sx={{ pb: { xs: 5, sm: 8 }}}>
        <Typography
          variant="h3"
          display={{ xs: 'none', sm: 'block' }}
          gutterBottom
          sx={{ mb: { xs: 0, sm: 2 } }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          display={{ xs: 'block', sm: 'none' }}
          gutterBottom
          sx={{ mb: { xs: 0, sm: 2 } }}
        >
          {mobileTitle ?? title}
        </Typography>
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
        >
          {mobileSubtitle ?? subtitle}
        </Typography>
      </Stack>
      {children}
      {footer}
    </Stack>
  )
}
