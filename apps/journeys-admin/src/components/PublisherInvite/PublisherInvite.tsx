import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import logo from '../../../public/logo.svg'

export function PublisherInvite(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pb: 10
        }}
      >
        <Link href="/" passHref>
          <a>
            <Image src={logo} alt="Next Steps" height={68} width={152} />
          </a>
        </Link>
      </Box>
      <Card
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <CardContent>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('You need access')}
          </Typography>
          <Typography>
            {t('You need to be a publisher to view this template.')}
          </Typography>
        </CardContent>
        <CardActions>
          <Link href="/" passHref>
            <Button variant="contained">Back to the Admin Panel</Button>
          </Link>
        </CardActions>
      </Card>
    </Container>
  )
}
