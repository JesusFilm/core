'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ReactElement } from 'react'

import { useVideo } from '../../../../../../libs/useVideo'

export function VideoView(): ReactElement {
  const params = useParams<{ videoId: string; locale: string }>()

  const { data } = useVideo({
    variables: { videoId: params?.videoId as string }
  })

  return (
    <Stack gap={2} sx={{ width: '100%' }} data-testid="VideoView">
      <Typography variant="h4">{data?.video.title[0].value}</Typography>
      <Stack gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box
          sx={{
            position: 'relative',
            height: 225,
            width: { xs: 'auto', sm: 400 },
            borderRadius: 2,
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <Image
            src={data?.video.image as string}
            alt={`${data?.video.imageAlt[0].value}`}
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Stack direction="column" sx={{ width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1">
                {data?.video.description[0].value}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  )
}
