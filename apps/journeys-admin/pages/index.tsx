import { ReactElement } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import { SignIn } from '../src/components/SignIn'
import Image from 'next/image'
import JesusFilmSignInLogo from '../public/JesusFilmSignInLogo.svg'

function Dashboard(): ReactElement {
  const theme = useTheme()

  const handleFeedbackSupport = (): void => {
    const subject = 'Support/Feedback Request'
    window.location.assign(`mailto:support@nextstep.is?Subject=${subject}`)
  }

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 30
        }}
      >
        <Image
          src={JesusFilmSignInLogo}
          alt="Jesus Film Sign In Logo"
          height={68}
          width={152}
        />
        <Typography variant={'h5'} sx={{ mt: 20, mb: 3 }}>
          Sign In
        </Typography>
        <SignIn />
        <Typography
          variant={'body2'}
          sx={{ mt: 20, color: theme.palette.primary.main, cursor: 'pointer' }}
          onClick={handleFeedbackSupport}
        >
          Feedback & Support
        </Typography>
      </Box>
    </ThemeProvider>
  )
}

export default Dashboard
