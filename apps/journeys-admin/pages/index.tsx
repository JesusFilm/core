import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

function Dashboard(): ReactElement {
  return (
    <Container sx={{ my: 10 }}>
      <Typography variant={'h1'} sx={{ mb: 8 }}>
        Dashboard
      </Typography>
      <Box my={2}>
        <Link href={`/journeys`} passHref>
          <Button variant="contained" fullWidth>
            Journeys List
          </Button>
        </Link>
      </Box>
    </Container>
  )
}

export default Dashboard
