import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { ReactElement } from 'react'

export function SeeAllVideos(): ReactElement {
  return (
    <Stack sx={{ pt: '54px', alignItems: 'center' }}>
      <NextLink href="/videos" passHref legacyBehavior>
        <Button
          size="small"
          color="secondary"
          variant="outlined"
          aria-label="all-videos-button"
          sx={{
            width: '15%',
            whiteSpace: 'nowrap'
          }}
        >
          See All
        </Button>
      </NextLink>
    </Stack>
  )
}
