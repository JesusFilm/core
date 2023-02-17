import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Link from 'next/link'

export function SeeAllVideos(): ReactElement {
  return (
    <Stack sx={{ pt: '54px', alignItems:"center"}}>
      <Link href="/videos" passHref>
        <Button
              size="small"
              color="secondary"
              variant="outlined"
              aria-label="all-videos-button-small"
              sx={{
                width: '15%',
                whiteSpace: 'nowrap'
              }}
            >
          See All
        </Button>
      </Link>
    </Stack>
  )
}
