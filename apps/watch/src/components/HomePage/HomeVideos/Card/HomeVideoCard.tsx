import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import PlayArrow from '@mui/icons-material/PlayArrowRounded'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import ButtonBase from '@mui/material/ButtonBase'
import NextImage from 'next/image'
import Box from '@mui/material/Box'
import { getLabelDetails } from '../../../../libs/utils/getLabelDetails/getLabelDetails'
import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

interface VideoListCardProps {
  video?: VideoChildFields
}

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  borderRadius: 8,
  width: '100%',
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

const Layer = styled(Box)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  borderRadius: 8,
  overflow: 'hidden'
})

export function HomeVideoCard({ video }: VideoListCardProps): ReactElement {
  const { label, color, childLabel } = getLabelDetails(video?.label)
  return (
    <Link href={`/${video?.variant?.slug ?? ''}`} passHref>
      <ImageButton
        focusRipple
        sx={{
          height: {
            xs: 166,
            md: 136,
            xl: 146
          }
        }}
      >
        {video?.image != null && (
          <Layer>
            <NextImage
              src={video?.image}
              layout="fill"
              objectFit="cover"
              objectPosition="left top"
            />
          </Layer>
        )}
        <Layer
          sx={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0) 37.81%, rgba(0, 0, 0, 0.8) 100%)',
            transition: (theme) => theme.transitions.create('opacity'),
            boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12)'
          }}
          className="MuiImageBackdrop-root"
        />
        <Layer
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 4
          }}
        >
          <Typography
            variant="h6"
            sx={{
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
            sx={{ minWidth: 0 }}
          >
            <Typography
              variant="overline2"
              color={color}
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {label}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 2,
                height: 29,
                color: 'primary.contrastText',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                flexShrink: 0
              }}
            >
              {video?.children.length === 0 && (
                <>
                  <PlayArrow sx={{ fontSize: '1rem' }} />
                  <Typography variant="body1" sx={{ lineHeight: '16px' }}>
                    {secondsToTimeFormat(video?.variant?.duration ?? 0, {
                      trimZeroes: true
                    })}
                  </Typography>
                </>
              )}
              {(video?.children.length ?? 0) > 0 && (
                <Typography variant="body1">
                  {video?.children.length} {childLabel}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Layer>
      </ImageButton>
    </Link>
  )
}
