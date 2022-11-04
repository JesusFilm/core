import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import PlayArrow from '@mui/icons-material/PlayArrow'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import ButtonBase from '@mui/material/ButtonBase'

import { VideoType } from '../../../../__generated__/globalTypes'
import { GetHomeVideos_videos } from '../../../../__generated__/GetHomeVideos'

export enum FilmType {
  animation = 'Animation',
  collection = 'Collection',
  feature = 'Feature Film',
  series = 'Series'
}

const designationColors = {
  [FilmType.animation]: '#7283BE',
  [FilmType.collection]: '#FF9E00',
  [FilmType.feature]: '#FF9E00',
  [FilmType.series]: '#3AA74A'
}

interface VideoListCardProps {
  video?: GetHomeVideos_videos
  designation?: FilmType
}

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 160,
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15
    },
    '& .MuiImageMarked-root': {
      opacity: 0
    }
  }
}))

const ImageSpan = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white
}))

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
  borderRadius: '8px'
})

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.18)'
}))

export function HomeVideoCard({
  video,
  designation
}: VideoListCardProps): ReactElement {
  return (
    <Link href={`/${video?.slug[0]?.value ?? ''}`} passHref>
      <ImageButton focusRipple style={{ width: 338, height: 160 }}>
        <ImageSrc
          style={{
            backgroundImage: `url(${video?.image ?? ''})`
          }}
        />
        <ImageBackdrop className="MuiImageBackdrop-root" />
        <ImageSpan>
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              left: 14,
              bottom: 42,
              padding: 0,
              textShadow:
                '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 2px 3px rgba(0, 0, 0, 0.45)'
            }}
          >
            {video?.title[0].value}
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p={0}
            position="absolute"
            left={14}
            bottom={12}
            right={14}
          >
            <Typography
              variant="overline2"
              color={designationColors[designation?.toString() ?? '']}
              p={0}
            >
              {designation}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              px="4px"
              py="8px"
              gap="2px"
              borderRadius="8px"
              height={29}
              color="primary.contrastText"
              bgcolor="rgba(0, 0, 0, 0.5)"
            >
              {video?.type !== VideoType.playlist && (
                <Stack direction="row">
                  <PlayArrow sx={{ fontSize: '1rem' }} />
                  <Typography variant="body1" sx={{ lineHeight: '16px' }}>
                    {secondsToTimeFormat(video?.variant?.duration ?? 0)}
                  </Typography>
                </Stack>
              )}
              {video?.type === VideoType.playlist && (
                <Typography variant="body1">
                  {video?.episodeIds.length} episodes
                </Typography>
              )}
            </Stack>
          </Stack>
        </ImageSpan>
      </ImageButton>
    </Link>
  )
}
