'use client'

import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { SxProps , styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px'
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px'
  })
}))

const Container = styled(Stack)(({ theme }) => ({
  height: '100dvh',
  padding: 20,
  backgroundImage:
    'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
  backgroundRepeat: 'no-repeat',
  ...theme.applyStyles('dark', {
    backgroundImage:
      'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))'
  })
}))

interface CenterPageProps {
  children: ReactNode
}
export function CenterPage({ children }: CenterPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Container
      direction="column"
      justifyContent="space-evenly"
      data-testid="CenterPageContainer"
    >
      <Stack
        alignItems="center"
        gap={5}
        sx={{
          display: { xs: 'none', sm: 'flex' }
        }}
      >
        <Card variant="outlined" data-testid="CenterPageCard">
          {children}
        </Card>
        <Button size="small">
          <Typography
            variant="body2"
            sx={{ color: '#C52D3A', cursor: 'pointer' }}
            component="a"
            href="https://www.cru.org/us/en/about/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Privacy Policy')}
          </Typography>
        </Button>
      </Stack>
    </Container>
  )
}
