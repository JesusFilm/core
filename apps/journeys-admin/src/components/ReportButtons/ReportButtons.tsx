import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

interface ReportButtonProps {
  pageName: 'journeys' | 'visitor'
}

export function ReportButtons({ pageName }: ReportButtonProps): ReactElement {
  const router = useRouter()
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderBottom: 1
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 6, sm: 8 }, marginLeft: 0 }}>
        <Stack direction="row" spacing={16} sx={{ py: 2 }}>
          <Button
            id="journeys"
            onClick={async () =>
              await router.push('/reports/journeys', undefined, {
                shallow: true
              })
            }
          >
            <Typography
              fontWeight="bold"
              color={pageName === 'journeys' ? 'primary' : 'divider'}
            >
              Journeys
            </Typography>
          </Button>
          <Button
            onClick={async () =>
              await router.push('/reports/visitors', undefined, {
                shallow: true
              })
            }
          >
            <Typography
              fontWeight="bold"
              color={pageName === 'visitor' ? 'primary' : 'divider'}
            >
              Visitors
            </Typography>
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}
