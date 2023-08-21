import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth
} from 'firebase/auth'
import Image from 'next/legacy/image'
import { ReactElement, useEffect, useState } from 'react'

import { StyledFirebaseAuth } from '@core/shared/ui/StyledFirebaseAuth'

import logo from '../../../public/logo.svg'

export function SignIn(): ReactElement {
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
        >
          <Image src={logo} alt="Next Steps" height={68} width={152} />
          <Typography variant="h5" sx={{ mt: 20, mb: 3 }}>
            Sign In
          </Typography>
          <StyledFirebaseAuth
            uiConfig={firebaseAuthConfig}
            firebaseAuth={getAuth(getApp())}
          />
          <Typography
            variant="body2"
            sx={{ mt: 20, color: 'primary.main', cursor: 'pointer' }}
            component="a"
            href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
          >
            Feedback & Support
          </Typography>
        </Box>
      ) : null}
    </div>
  )
}
