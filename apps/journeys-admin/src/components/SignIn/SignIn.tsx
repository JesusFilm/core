import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { LanguageSwitcher } from '../LanguageSwitcher'

import { EmailUsedPage } from './EmailUsedPage'
import { HomePage } from './HomePage'
import { PasswordPage } from './PasswordPage'
import { PasswordResetPage } from './PasswordResetPage'
import { RegisterPage } from './RegisterPage'
import { ResetPasswordSentPage } from './ResetPasswordSentPage'
import { ActivePage, PageProps } from './types'

export function SignIn(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [activePage, setActivePage] = useState<ActivePage>('home')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPassword, setUserPassword] = useState<string>('')
  const [open, setOpen] = useState(false)

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
        justifyContent: 'center'
      }}
      data-testid="JourneysAdminSignIn"
    >
      <Card
        sx={{
          height: { xs: '100vh', sm: 'inherit' },
          width: { xs: '100vw', sm: 397 },
          mt: { xs: 0, sm: 10 },
          borderRadius: { xs: 6, sm: 2 }
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            p: 6,
            pt: 7
          }}
        >
          {page}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={4}
            sx={{
              display: { xs: 'box', sm: 'none' }
            }}
          >
            <Button size="small">
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                component="a"
                href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request"
              >
                {t('Feedback & Support')}
              </Typography>
            </Button>
            <Button size="small" onClick={() => setOpen(true)}>
              <Typography variant="body2">{t('Language')}</Typography>
            </Button>
          </Stack>
          {open && (
            <LanguageSwitcher open={open} handleClose={() => setOpen(false)} />
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
