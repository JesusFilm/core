import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  getAuth,
  signInWithPopup
} from 'firebase/auth'
import { Form, Formik, FormikHelpers } from 'formik'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { InferType, object, string } from 'yup'

import logo from '../../../public/logo.svg'

import FacebookIconSquare from './assets/FacebookIconSquare'
import GoogleIcon from './assets/GoogleIcon'

export function SignIn(): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Required'))
  })

  async function handleEmailSignIn(
    values: InferType<typeof validationSchema>,
    actions: FormikHelpers<InferType<typeof validationSchema>>
  ): Promise<void> {
    const auth = getAuth()
    const result = await fetchSignInMethodsForEmail(auth, values.email)
    console.log(result)
  }

  async function handleGoogleSignIn(): Promise<void> {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
    await router.push('/')
  }

  async function handleFacebookSignIn(): Promise<void> {
    const auth = getAuth()
    await signInWithPopup(auth, new FacebookAuthProvider())
    // .catch((error) => {
    //   // Handle Errors here.
    //   const errorCode = error.code
    //   const errorMessage = error.message
    //   // The email of the user's account used.
    //   const email = error.customData.email
    //   // The AuthCredential type that was used.
    //   const credential = FacebookAuthProvider.credentialFromError(error)

    //   // ...
    // })
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
          borderRadius: { xs: 0, sm: 2 }
        }}
      >
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 6, pt: 7 }}
        >
          <Box>
            <Typography variant="h5" textAlign="center" gutterBottom>
              {t('Log in or Sign up')}
            </Typography>
            <Typography variant="body2" textAlign="center">
              {t("No account? We'll create one for you automatically.")}
            </Typography>
          </Box>
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
          <Formik
            initialValues={{ email: '' }}
            onSubmit={handleEmailSignIn}
            validationSchema={validationSchema}
          >
            {({
              values,
              handleChange,
              handleBlur,
              errors,
              touched,
              isValid,
              isSubmitting
            }) => (
              <Form noValidate autoComplete="off" data-testid="EmailSignInForm">
                <Stack gap={4}>
                  <TextField
                    name="email"
                    hiddenLabel
                    placeholder={t('Enter your email address here')}
                    variant="filled"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email != null && touched.email != null}
                    helperText={
                      touched?.email != null &&
                      errors.email != null &&
                      errors.email
                    }
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ backgroundColor: 'secondary.dark' }}
                    startIcon={<MailOutlineIcon />}
                    type="submit"
                    disabled={!isValid || isSubmitting}
                  >
                    {t('Sign in with email')}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
          <Divider sx={{ width: 397 }} />
          <Typography
            variant="body2"
            color="primary"
            textAlign="center"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ gap: 3 }}
          >
            <HelpOutlineIcon color="secondary" />
            <Link href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request">
              {t('Need help?')}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
