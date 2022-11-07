import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

interface ReportButtonProps {
  selected: 'journeys' | 'visitors'
}

export function ReportButtons({ selected }: ReportButtonProps): ReactElement {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 6, sm: 8 }, marginLeft: 0 }}>
        <Stack direction="row" spacing={16} sx={{ py: 2 }}>
          <NextLink href="/reports/journeys" passHref>
            <Button aria-selected={selected === 'journeys'}>
              <Typography
                variant="subtitle2"
                color={selected === 'journeys' ? 'primary' : 'divider'}
              >
                Journeys
              </Typography>
            </Button>
          </NextLink>
          <NextLink href="/reports/visitors" passHref>
            <Button aria-selected={selected === 'visitors'}>
              <Typography
                variant="subtitle2"
                color={selected === 'visitors' ? 'primary' : 'divider'}
              >
                Visitors
              </Typography>
            </Button>
          </NextLink>
        </Stack>
      </Container>
    </Box>
  )
}
