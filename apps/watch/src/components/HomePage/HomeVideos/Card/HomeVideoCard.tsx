import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import PlayArrow from '@mui/icons-material/PlayArrow'
import { secondsToTimeFormatTrimmed } from '@core/shared/ui/timeFormat'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import ButtonBase from '@mui/material/ButtonBase'
import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

export enum FilmType {
  collection = 'Collection',
  episode = 'Episode',
  featureFilm = 'Feature Film',
  segment = 'Segment',
  series = 'Series',
  shortFilm = 'Short Film'
}

const designationColors = {
  collection: '#FF9E00',
  episode: '#7283BE',
  segment: '#7283BE',
  featureFilm: '#FF9E00',
  series: '#3AA74A',
  shortFilm: '#FF9E00'
}

interface VideoListCardProps {
  video?: VideoChildFields
}

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  width: '100%',
  minWidth: 266,
  maxWidth: 338,
  minHeight: 136,
  maxHeight: 160,
  position: 'relative',
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
  objectFit: 'cover',
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

export function HomeVideoCard({ video }: VideoListCardProps): ReactElement {
  return (
    <Link href={`/${video?.variant?.slug ?? ''}`} passHref>
      <ImageButton focusRipple>
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
              color={designationColors[video?.label ?? ''] ?? ''}
              p={0}
            >
              {FilmType[video?.label ?? '']}
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
              {video?.children.length === 0 && (
                <Stack direction="row">
                  <PlayArrow sx={{ fontSize: '1rem' }} />
                  <Typography variant="body1" sx={{ lineHeight: '16px' }}>
                    {secondsToTimeFormatTrimmed(video?.variant?.duration ?? 0)}
                  </Typography>
                </Stack>
              )}
              {(video?.children.length ?? 0) > 0 && (
                <Typography variant="body1">
                  {video?.children.length} episodes
                </Typography>
              )}
            </Stack>
          </Stack>
        </ImageSpan>
      </ImageButton>
    </Link>
  )
}
