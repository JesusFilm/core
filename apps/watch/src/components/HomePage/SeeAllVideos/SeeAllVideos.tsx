import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Link from 'next/link'

export interface Props {
  value?: string
}

export function SeeAllVideos({ value = '' }: Props): ReactElement {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={4}
      sx={{
        pb: { xs: '32px', sm: '44px' },
        pt: { xs: '28px', sm: '68px' }
      }}
    >
      <Typography
        sx={{ typography: { xs: 'h5', sm: 'h4', md: 'h3', lg: 'h2' } }}
      >
        {value.length < 0 ? value : '+53 Short Evangelical Films'}
      </Typography>
      <Link href="/videos" passHref>
        <>
          <Button
            size="small"
            color="secondary"
            variant="outlined"
            aria-label="all-videos-button"
            sx={{
              display: { xs: 'flex', lg: 'none' },
              whiteSpace: 'nowrap'
            }}
          >
            See Full Lineup
          </Button>
          <Button
            size="large"
            color="secondary"
            variant="outlined"
            aria-label="all-videos-button"
            sx={{
              display: { xs: 'none', lg: 'flex' },
              whiteSpace: 'nowrap'
            }}
          >
            See Full Lineup
          </Button>
        </>
      </Link>
    </Stack>
  )
}
