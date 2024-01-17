import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import logo from '../../../public/logo.svg'

import { EmailUsedPage } from './EmailUsedPage'
import { HomePage } from './HomePage'
import { PasswordPage } from './PasswordPage'
import { PasswordResetPage } from './PasswordResetPage'
import { RegisterPage } from './RegisterPage'

export type ActivePage =
  | 'home'
  | 'password'
  | 'register'
  | 'google.com'
  | 'facebook.com'
  | 'help'

export function SignIn(): ReactElement {
  const { t } = useTranslation()
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const [userEmail, setUserEmail] = useState<string>('')

  const setEmail = (email): void => {
    setUserEmail(email)
  }
  let children
  switch (activePage) {
    case 'home':
      children = <HomePage setActivePage={setActivePage} setEmail={setEmail} />
      break
    case 'password':
      children = (
        <PasswordPage setActivePage={setActivePage} userEmail={userEmail} />
      )
      break
    case 'register':
      children = (
        <RegisterPage setActivePage={setActivePage} userEmail={userEmail} />
      )
      break
    case 'google.com':
      children = <EmailUsedPage userEmail={userEmail} variant="Google" />
      break
    case 'facebook.com':
      children = <EmailUsedPage userEmail={userEmail} variant="Facebook" />
      break
    case 'help':
      children = (
        <PasswordResetPage
          setActivePage={setActivePage}
          userEmail={userEmail}
        />
      )
      break
    default:
      break
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
      <Image src={logo} alt="Next Steps" height={41} width={228} />
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
          {children}
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
            <Link
              sx={{ textDecoration: 'none' }}
              href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
            >
              {t('Need help?')}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
