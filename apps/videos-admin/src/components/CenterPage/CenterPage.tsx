'use client'

import MuiCard from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
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
  return (
    <Container direction="column" justifyContent="space-between">
      <Card variant="outlined">{children}</Card>
    </Container>
  )
}
