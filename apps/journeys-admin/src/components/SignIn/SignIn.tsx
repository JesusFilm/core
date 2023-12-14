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

import { Home } from './Home'

export type ActivePage =
  | 'home'
  | 'password'
  | 'register'
  | 'google.com'
  | 'facebook.com'

export function SignIn(): ReactElement {
  const { t } = useTranslation()
  const [activePage, setActivePage] = useState<ActivePage>('home')

  let children
  switch (activePage) {
    case 'home':
      children = <Home setActivePage={setActivePage} />
      break
    case 'password':
      children = <></>
      break
    case 'register':
      children = <></>
      break
    case 'google.com':
      children = <></>
      break
    case 'facebook.com':
      children = <></>
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
            <Link href="mailto:support@nextstep.is?Subject=Support%2FFeedback%20Request">
              {t('Need help?')}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
