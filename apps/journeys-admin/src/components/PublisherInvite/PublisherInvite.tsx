import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import logo from '../../../public/logo.svg'

export function PublisherInvite(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Container
      maxWidth="xs"
      sx={{ py: 10 }}
      data-testid="JourneysAdminPublisherInvite"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pb: 10
        }}
      >
        <NextLink href="/" prefetch={false}>
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
        </NextLink>
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
          <Button LinkComponent={NextLink} href="/" variant="contained">
            {t('Back to the Admin Panel')}
          </Button>
        </CardActions>
      </Card>
    </Container>
  )
}
