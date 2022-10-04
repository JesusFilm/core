import { ReactElement } from 'react'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../../../public/logo.svg'

interface AccessDeniedProps {
  title: string
  description: string
  onClick?: () => void
}

export function AccessDenied({
  title,
  description,
  onClick
}: AccessDeniedProps): ReactElement {
  const requestAccess = onClick != null

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
      <Card variant="outlined" sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
        <CardContent>
          <Typography variant="h3" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography>{description}</Typography>
        </CardContent>
        <CardActions>
          {requestAccess ? (
            <Button variant="outlined" onClick={onClick}>Request Access</Button>
          ) : (
            <Link href="/" passHref>
              <Button variant="outlined" >Back to the Admin Panel</Button>
            </Link>
          )}
        </CardActions>
      </Card>
    </Container>
  )
}
