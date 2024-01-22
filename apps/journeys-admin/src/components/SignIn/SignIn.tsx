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
import { ResetPasswordSentPage } from './ResetPasswordSentPage'
import { ActivePage, PageProps } from './types'

export function SignIn(): ReactElement {
  const { t } = useTranslation()
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPassword, setUserPassword] = useState<string>('')

  let page: ReactElement<PageProps>
  const props: PageProps = {
    activePage,
    setActivePage,
    userEmail,
    setUserEmail,
    userPassword,
    setUserPassword
  }

  switch (activePage) {
    case 'home':
      page = <HomePage {...props} />
      break
    case 'password':
      page = <PasswordPage {...props} />
      break
    case 'register':
      page = <RegisterPage {...props} />
      break
    case 'google.com':
      page = <EmailUsedPage {...props} activePage="google.com" />
      break
    case 'facebook.com':
      page = <EmailUsedPage {...props} activePage="facebook.com" />
      break
    case 'help':
      page = <PasswordResetPage {...props} />
      break
    case 'reset':
      page = <ResetPasswordSentPage {...props} />
      break
    default:
      page = <></>
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
          {page}
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
