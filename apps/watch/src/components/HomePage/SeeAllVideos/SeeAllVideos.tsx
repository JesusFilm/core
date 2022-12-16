import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Link from 'next/link'

export function SeeAllVideos(): ReactElement {
  return (
    <Stack sx={{ pt: '54px' }}>
      <Typography
        variant="overline1"
        color="#7283BE"
        sx={{
          pb: 3
        }}
      >
        Conversation Starters
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={4}
      >
        <Typography variant="h2">+53 Short Evangelical Films</Typography>
        <>
          <Link href="/videos" passHref>
            <Button
              size="small"
              color="secondary"
              variant="outlined"
              aria-label="all-videos-button-small"
              sx={{
                display: { xs: 'flex', lg: 'none' },
                whiteSpace: 'nowrap'
              }}
            >
              See Full Lineup
            </Button>
          </Link>
          <Link href="/videos" passHref>
            <Button
              size="large"
              color="secondary"
              variant="outlined"
              aria-label="all-videos-button-large"
              sx={{
                display: { xs: 'none', lg: 'flex' },
                whiteSpace: 'nowrap'
              }}
            >
              See Full Lineup
            </Button>
          </Link>
        </>
      </Stack>
    </Stack>
  )
}
