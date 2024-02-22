import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { getApp } from 'firebase/app'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth
} from 'firebase/auth'
import Image from 'next/image'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StyledFirebaseAuth } from '@core/shared/ui/StyledFirebaseAuth'

import logo from '../../../public/logo.svg'
import { LanguageSwitcher } from '../LanguageSwitcher'

export function SignIn(): ReactElement {
  const [open, setOpen] = useState(false)

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
        provider: EmailAuthProvider.PROVIDER_ID
      },
      {
        provider: GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        }
      },
      {
        provider: FacebookAuthProvider.PROVIDER_ID
      }
    ],
    callbacks: {
      signInSuccessWithAuthResult: () =>
        // Don't automatically redirect. We handle redirects using
        // `next-firebase-auth`.
        false
    }
  }
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <div>
      {renderAuth ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pt: 30
          }}
          data-testid="JourneysAdminSignIn"
        >
          <Image
            src={logo}
            alt="Next Steps"
            height={68}
            width={152}
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
          <Typography variant="h5" sx={{ mt: 20, mb: 3 }}>
            {t('Sign In')}
          </Typography>
          <StyledFirebaseAuth
            uiConfig={firebaseAuthConfig}
            firebaseAuth={getAuth(getApp())}
          />
          <Stack direction="row" alignItems="center" gap={4} mt={20}>
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              component="a"
              href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
            >
              {t('Feedback & Support')}
            </Typography>
            <Button size="small" onClick={() => setOpen(true)}>
              <Typography variant="body2">{t('Language')}</Typography>
            </Button>
          </Stack>
          {open && (
            <LanguageSwitcher open={open} handleClose={() => setOpen(false)} />
          )}
        </Box>
      ) : null}
    </div>
  )
}
