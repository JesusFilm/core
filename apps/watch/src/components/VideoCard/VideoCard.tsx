import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import PlayArrow from '@mui/icons-material/PlayArrowRounded'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import NextLink from 'next/link'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import { styled, SxProps } from '@mui/material/styles'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { VideoLabel } from '../../../__generated__/globalTypes'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'

interface VideoCardProps {
  video?: VideoChildFields
  variant?: 'contained' | 'expanded'
  containerSlug?: string
  index?: number
  active?: boolean
  imageSx?: SxProps
}

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  borderRadius: 8,
  width: '100%',
  position: 'relative'
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

export function getSlug(
  containerSlug: string | undefined,
  label: VideoLabel | undefined,
  variantSlug: string | undefined
): string {
  if (
    containerSlug != null &&
    label !== undefined &&
    ![VideoLabel.collection, VideoLabel.series].includes(label)
  ) {
    return `/${containerSlug}.html/${variantSlug ?? ''}.html`
  } else {
    const [videoId, languageId] = (variantSlug ?? '').split('/')
    return `/${videoId}.html/${languageId}.html`
  }
}

export function VideoCard({
  video,
  containerSlug,
  variant = 'expanded',
  index,
  active,
  imageSx
}: VideoCardProps): ReactElement {
  const { label, color, childCountLabel } = getLabelDetails(
    video?.label,
    video?.childrenCount ?? 0
  )
  const href = getSlug(containerSlug, video?.label, video?.variant?.slug)

  return (
    <NextLink href={href} passHref>
      <Link
        display="block"
        underline="none"
        color="inherit"
        sx={{ pointerEvents: video != null ? 'auto' : 'none' }}
        data-testid="VideoCard"
      >
        <Stack spacing={3}>
          <ImageButton
            disabled={video == null}
            sx={{
              overflow: 'hidden',
              aspectRatio: '16 / 9',
              '&:hover, &.Mui-focusVisible': {
                '& .MuiImageBackground-root': {
                  transform: 'scale(1.02)'
                },
                '& .MuiImageBackdrop-contained-root': {
                  opacity: 0.15
                },
                '& .MuiImageBackdrop-expanded-root': {
                  opacity: 0.5
                }
              },
              ...imageSx
            }}
          >
            <Layer
              className="MuiImageBackground-root"
              sx={{
                background: 'rgba(0,0,0,0.5)',
                transition: (theme) => theme.transitions.create('transform')
              }}
            >
              {video?.image != null ? (
                <Image
                  src={video.image}
                  layout="fill"
                  objectFit="cover"
                  objectPosition="left top"
                  alt={video.title[0].value}
                />
              ) : (
                <Box
                  sx={{
                    aspectRatio: '16 / 9'
                  }}
                >
                  <Skeleton
                    sx={{ width: '100%', height: '100%' }}
                    variant="rectangular"
                    animation={false}
                    data-testid="VideoImageSkeleton"
                  />
                </Box>
              )}
            </Layer>
            {variant === 'contained' && (
              <Layer
                sx={{
                  background:
                    'linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.8) 100%)',
                  transition: (theme) => theme.transitions.create('opacity'),
                  boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12)'
                }}
                className="MuiImageBackdrop-contained-root"
              />
            )}
            {variant === 'expanded' && (
              <Layer
                sx={{
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.6) 100%)',
                  transition: (theme) => theme.transitions.create('opacity'),
                  opacity: 0.15
                }}
                className="MuiImageBackdrop-expanded-root"
              />
            )}
            <Layer
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: variant === 'contained' ? 4 : 1
              }}
            >
              {variant === 'contained' && (
                <Typography
                  variant="h6"
                  component="h3"
                  color="primary.contrastText"
                  sx={{
                    textAlign: 'left',
                    textShadow:
                      '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 2px 3px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  {video != null ? (
                    video?.title[0].value
                  ) : (
                    <Skeleton width="60%" data-testid="VideoTitleSkeleton" />
                  )}
                </Typography>
              )}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
                sx={{ minWidth: 0 }}
                spacing={2}
              >
                <Typography
                  variant="overline2"
                  color={color}
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    lineHeight: '29px'
                  }}
                >
                  {variant === 'contained' &&
                    (video != null ? (
                      label
                    ) : (
                      <Skeleton width={50} data-testid="VideoLabelSkeleton" />
                    ))}
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
                    backgroundColor:
                      active === true ? 'primary.main' : 'rgba(0, 0, 0, 0.5)',
                    flexShrink: 0
                  }}
                >
                  {active === true ? (
                    <>
                      <PlayArrow sx={{ fontSize: '1rem' }} />
                      <Typography>Playing now</Typography>
                    </>
                  ) : (
                    <>
                      {video == null && (
                        <>
                          <PlayArrow sx={{ fontSize: '1rem' }} />
                          <Skeleton
                            width={20}
                            data-testid="VideoVariantDurationSkeleton"
                          />
                        </>
                      )}
                      {video?.childrenCount === 0 && (
                        <>
                          <PlayArrow sx={{ fontSize: '1rem' }} />
                          <Typography>
                            {secondsToTimeFormat(
                              video?.variant?.duration ?? 0,
                              {
                                trimZeroes: true
                              }
                            )}
                          </Typography>
                        </>
                      )}
                      {(video?.childrenCount ?? 0) > 0 && (
                        <Typography>{childCountLabel.toLowerCase()}</Typography>
                      )}
                    </>
                  )}
                </Stack>
              </Stack>
            </Layer>
          </ImageButton>
          {variant === 'expanded' && (
            <>
              {index != null && (
                <Typography variant="overline2" sx={{ opacity: 0.5 }}>
                  {video != null ? (
                    `${label} ${
                      video.label === VideoLabel.episode ||
                      video.label === VideoLabel.segment
                        ? index + 1
                        : ''
                    }`.trim()
                  ) : (
                    <Skeleton
                      width="20%"
                      data-testid="VideoLabelIndexSkeleton"
                    />
                  )}
                </Typography>
              )}
              <Typography color="textPrimary" variant="h6" component="h3">
                {video != null ? (
                  video?.title[0].value
                ) : (
                  <Skeleton width="60%" data-testid="VideoTitleSkeleton" />
                )}
              </Typography>
            </>
          )}
        </Stack>
      </Link>
    </NextLink>
  )
}
