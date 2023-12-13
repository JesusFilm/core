import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
} from 'firebase/auth'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import logo from '../../../public/logo.svg'

import FacebookIconSquare from './assets/FacebookIconSquare'
import GoogleIcon from "./assets/GoogleIcon"

export function SignIn(): ReactElement {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')

  const handleEmailSignIn = () => {
    console.log(`Signing in with email: ${email}`)
  }

  const handleGoogleSignIn = () => {
    console.log('Signing in with google')
  }

  const handleFacebookSignIn = () => {
    console.log('Signing in with Facebook')
  }

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 30
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
      <Card
        sx={{
          width: { xs: '100%', sm: 397 },
          mt: 10,
          borderRadius: { xs: 0, sm: 2}
        }}
      >
        <CardContent sx={{display: 'flex', flexDirection: 'column', gap: 4, p: 6, pt: 7}}>
          <Box>
            <Typography variant="h5" textAlign="center" gutterBottom>
              {t('Log in or Sign up')}
            </Typography>
            <Typography variant="body2" textAlign="center">
              {t("No account? We'll create one for you automatically.")}
            </Typography></Box>
          <Button
            variant="outlined"
            size="large"
            color="secondary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            fullWidth
          >
            {t('Sign in with Google')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="secondary"
            startIcon={<FacebookIconSquare />}
            onClick={handleFacebookSignIn}
            fullWidth
          >
            {t('Sign in with Facebook')}
          </Button>
          <Divider>{t('OR')}</Divider>
          <TextField
            hiddenLabel
            id="filled-basic"
            placeholder={t('Enter your email address here')}
            variant="filled"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ backgroundColor: 'secondary.dark' }}
            startIcon={<MailOutlineIcon />}
            onClick={handleEmailSignIn}
          >
            {t('Sign in with email')}
          </Button>
          <Divider sx={{ width: 397 }} />
          <Typography
          variant="body2"
          color="primary"
          textAlign="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{gap: 3}}
        >
            <HelpOutlineIcon color="secondary" />
            <Link
          href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
          >
              {t('Need help?')}</Link>
          </Typography>
        </CardContent>

      </Card>
    </Box>
  )
}
