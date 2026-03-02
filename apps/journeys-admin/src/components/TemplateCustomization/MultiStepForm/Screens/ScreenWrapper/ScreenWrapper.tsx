import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface ScreenWrapperProps {
  title: string
  mobileTitle?: string
  subtitle: string
  mobileSubtitle?: string
  headerSx?: SxProps<Theme>
  footer?: ReactNode
  children: ReactNode
}

export function ScreenWrapper({
  title,
  mobileTitle,
  subtitle,
  mobileSubtitle,
  headerSx,
  footer,
  children
}: ScreenWrapperProps): ReactElement {
  return (
    <>
      <Stack alignItems="center" sx={headerSx}>
        <Typography
          variant="h4"
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
          variant="subtitle2"
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
    </>
  )
}
