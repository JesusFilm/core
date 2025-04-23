'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

export function VideoListHeader(): ReactElement {
  const router = useRouter()

  return (
    <Stack
      sx={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Typography variant="h4">Video Library</Typography>
      <Button
        onClick={() =>
          router.push('/videos/add', {
            scroll: false
          })
        }
        startIcon={<Plus2 />}
        variant="outlined"
      >
        Create
      </Button>
    </Stack>
  )
}
