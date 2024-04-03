import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import { EmailAuthProvider, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { useTranslation } from 'next-i18next'
import { FC, useEffect, useState } from 'react'

import { StyledFirebaseAuth } from '@core/shared/ui/StyledFirebaseAuth'

export const Login: FC = () => {
  // Do not SSR FirebaseUI, because it is not supported.
  // https://github.com/firebase/firebaseui-web/issues/213
  const [renderAuth, setRenderAuth] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRenderAuth(true)
    }
  }, [])

  const firebaseAuthConfig = {
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        },
        fullLabel: 'Login with Google'
      },
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        },
        fullLabel: 'Login with Email'
      }
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  }

  return (
    <div>
      {renderAuth ? (
        <Stack
          alignItems="center"
          sx={{
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 2,
            width: '400px',
            height: '500px',
            px: 4,
            pb: 4,
            pt: 8
          }}
        >
          <Stack>
            <Typography
              sx={{
                color: '#000',
                fontFamily: 'Montserrat',
                fontSize: '28px',
                fontWeight: 700
              }}
            >
              {t('Login')}
            </Typography>
            <Typography
              sx={{
                mt: 1,
                color: '#C4C4C4',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontWeight: 400
              }}
            >
              {t('Welcome to Nexus')}
            </Typography>
          </Stack>
          <Box
            sx={{
              my: 'auto'
            }}
          >
            <StyledFirebaseAuth
              uiConfig={firebaseAuthConfig}
              firebaseAuth={getAuth(getApp())}
            />
          </Box>
        </Stack>
      ) : null}
    </div>
  )
}
