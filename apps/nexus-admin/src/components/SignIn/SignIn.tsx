import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import { EmailAuthProvider, GoogleAuthProvider, getAuth } from 'firebase/auth'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { StyledFirebaseAuth } from '@core/shared/ui/StyledFirebaseAuth'

export function SignIn(): ReactElement {
  const { t } = useTranslation('apps-nexus-admin')
  // Do not SSR FirebaseUI, because it is not supported.
  // https://github.com/firebase/firebaseui-web/issues/213
  const [renderAuth, setRenderAuth] = useState(false)

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
        fullLabel: t('Continue with Google')
      },
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        },
        fullLabel: t('Continue with Email')
      }
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  }

  return (
    <Stack
      height="100svh"
      alignItems="center"
      justifyContent="center"
      spacing={8}
    >
      <Box sx={{ width: 400, height: 100, position: 'relative' }}>
        <Image src="/logo.png" alt="logo" fill objectFit="contain" />
      </Box>
      <Box>
        <Typography variant="h1" textAlign="center" gutterBottom>
          {t('Jesus Film Project')}
        </Typography>
        <Typography variant="h4" textAlign="center">
          {t('Nexus Control Panel')}
        </Typography>
      </Box>
      <Card sx={{ width: 400, borderRadius: 2, p: 4 }}>
        <CardContent sx={{ '&:last-child': { pb: 4 } }}>
          {renderAuth && (
            <Box
              sx={{
                '& .firebaseui-container': {
                  m: 0,
                  fontFamily: (theme) => theme.typography.fontFamily
                },
                '& .firebaseui-card-content': {
                  p: 0
                },
                '& .firebaseui-idp-button, & .firebaseui-button': {
                  boxShadow: 0,
                  border: '1px solid rgba(68, 68, 81, 0.5)',
                  borderRadius: 3,
                  color: (theme) => theme.palette.text.primary,
                  '& .firebaseui-idp-text': {
                    color: (theme) => theme.palette.text.primary
                  }
                },
                '& .firebaseui-idp-button': {
                  maxWidth: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                '& .firebaseui-idp-password, & .firebaseui-id-submit': {
                  backgroundColor: (theme) =>
                    `${theme.palette.secondary.main} !important`,
                  color: (theme) => theme.palette.secondary.contrastText,
                  '& .firebaseui-idp-text': {
                    color: (theme) => theme.palette.secondary.contrastText
                  }
                },
                '& .firebaseui-idp-text': {
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  color: 'rgb(68, 68, 81)',
                  fontFamily: 'Montserrat, sans-serif'
                },
                '& .firebaseui-idp-list': {
                  margin: 0,
                  '&>.firebaseui-list-item:last-child': {
                    marginBottom: 0
                  }
                },
                '& .mdl-card': {
                  boxShadow: 0,
                  '& .firebaseui-card-header': {
                    p: 0
                  },
                  '& .firebaseui-card-actions': {
                    p: 0,
                    pt: 2
                  }
                }
              }}
            >
              <StyledFirebaseAuth
                uiConfig={firebaseAuthConfig}
                firebaseAuth={getAuth(getApp())}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
