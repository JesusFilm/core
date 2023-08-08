import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'

import { BackgroundVideo } from './BackgroundVideo'

interface ContainedCoverProps {
  children: ReactNode[]
  backgroundColor: string
  backgroundBlur?: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  hasFullscreenVideo?: boolean
}

const StyledGradientBackground = styled(Stack)(() => ({
  position: 'absolute',
  bottom: 0,
  zIndex: 0,
  width: '100%',
  height: '300px'
}))

const StyledSoftBlurBackground = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  WebkitBackdropFilter: 'blur(1px)',
  backdropFilter: 'blur(1px)',
  [theme.breakpoints.up('lg')]: {
    height: '100%'
  }
}))

const StyledBlurBackground = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  WebkitBackdropFilter: 'blur(2px)',
  backdropFilter: 'blur(2px)',
  [theme.breakpoints.up('lg')]: {
    height: '100%'
  }
}))

export function ContainedCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: ContainedCoverProps): ReactElement {
  const [loading, setLoading] = useState(true)
  const [contentHeight, setContentHeight] = useState(0)
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const contentRef = useRef()

  const posterImage =
    videoBlock?.source !== VideoBlockSource.youTube &&
    videoBlock?.source !== VideoBlockSource.cloudflare
      ? // Use posterBlockId image or default poster image on video
        videoBlock?.posterBlockId != null
        ? (
            videoBlock.children.find(
              (block) =>
                block.id === videoBlock.posterBlockId &&
                block.__typename === 'ImageBlock'
            ) as TreeBlock<ImageFields>
          ).src
        : videoBlock?.video?.image
      : // Use Youtube set poster image
        videoBlock?.image

  useEffect(() => {
    if (contentRef.current != null) {
      setContentHeight(
        (contentRef.current as unknown as HTMLDivElement).clientHeight ?? 0
      )
    }
  }, [contentRef])

  const overlayGradient = (direction: string): string =>
    `linear-gradient(to ${direction}, transparent 0%,  ${backgroundColor}14 10%, ${backgroundColor}33 17%, ${backgroundColor}60 25%, ${backgroundColor}b0 40%, ${backgroundColor}e6 60%, ${backgroundColor} 98%)`

  const overlayImageMask = `linear-gradient(to top, transparent 0%, ${backgroundColor}14 5%, ${backgroundColor}33 10%, ${backgroundColor}60 15%, ${backgroundColor}b0 20%, ${backgroundColor}e6 25%, ${backgroundColor} 30%)`

  return (
    <>
      <Box
        data-testid="ContainedCover"
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          borderRadius: 'inherit'
        }}
      >
        {videoBlock?.videoId != null && (
          <BackgroundVideo {...videoBlock} setLoading={setLoading} />
        )}
        {/* NextImage poster image causes longer LCP loading times, but still faster since using optimized image */}
        {posterImage != null && videoBlock != null && loading && (
          <NextImage
            data-testid="video-poster-image"
            className="vjs-poster"
            src={posterImage}
            aria-details={posterImage}
            alt="card video image"
            layout="fill"
            objectFit="cover"
            sx={{
              transform:
                videoBlock?.source === VideoBlockSource.youTube
                  ? 'scale(1.35)'
                  : 'unset'
            }}
          />
        )}
        {/* Blurred Content Background image */}
        {imageBlock != null && backgroundBlur != null && (
          <>
            <NextImage
              data-testid="content-background-image"
              src={imageBlock.src ?? backgroundBlur}
              alt={imageBlock.alt}
              placeholder="blur"
              blurDataURL={backgroundBlur}
              layout="fill"
              objectFit="cover"
              sx={{ transform: 'scale(2) translate(0px, -25%)' }}
            />
            <Box
              sx={{
                width: '100%',
                height: '100%',
                WebkitBackdropFilter: 'blur(40px)',
                backdropFilter: 'blur(40px)',
                borderRadius: 'inherit'
              }}
            />
          </>
        )}
      </Box>
      {/* Background image, after overlay-content-container temp fix embed render bug */}
      <Box
        data-testid="overlay-image-container"
        sx={{
          width: '100%',
          height: hasFullscreenVideo ? undefined : '100%',
          flexGrow: 1,
          zIndex: 1,
          top: 0,
          position: { xs: 'relative', lg: 'absolute' },
          WebkitMask: { xs: overlayImageMask, lg: 'unset' },
          mask: { xs: overlayImageMask, lg: 'unset' }
        }}
      >
        {imageBlock != null && backgroundBlur != null && (
          <NextImage
            data-testid="background-image"
            src={imageBlock?.src ?? backgroundBlur}
            alt={imageBlock?.alt}
            placeholder="blur"
            blurDataURL={backgroundBlur}
            layout="fill"
            objectFit="cover"
          />
        )}
      </Box>
      <Stack
        data-testid="overlay-content-container"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: { xs: hasFullscreenVideo ? '100%' : undefined, lg: '100%' },
          justifyContent: { xs: 'flex-end', lg: 'center' },
          alignItems: { lg: rtl ? 'flex-start' : 'flex-end' }
        }}
      >
        {children.length !== 0 ? (
          <>
            <Stack
              data-testid="overlay-blur"
              sx={{
                width: { xs: videoBlock != null ? '100%' : '0%', lg: 380 },
                height: { xs: videoBlock != null ? '85%' : '0%', lg: '100%' },
                flexDirection: {
                  xs: 'column-reverse',
                  lg: rtl ? 'row' : 'row-reverse'
                },
                position: 'absolute'
              }}
            >
              <StyledSoftBlurBackground
                sx={{ width: { lg: 500 }, height: contentHeight - 40 }}
              />
              <StyledSoftBlurBackground
                sx={{ width: { lg: 450 }, height: contentHeight - 80 }}
              />
              <StyledSoftBlurBackground
                sx={{ width: { lg: 400 }, height: contentHeight * 0.9 - 80 }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 350 }, height: contentHeight * 0.8 - 80 }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 325 }, height: contentHeight * 0.7 - 80 }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 275 }, height: contentHeight * 0.6 - 80 }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 250 }, height: contentHeight * 0.5 - 80 }}
              />
            </Stack>

            <Stack
              ref={contentRef}
              data-testid="overlay-gradient"
              flexDirection="row"
              justifyContent="center"
              sx={{
                position: 'absolute',
                width: '100%',
                height: { xs: '100%', lg: '100%' },
                maxWidth: { xs: '100%', lg: '380px' },
                pt: { xs: videoBlock != null ? 40 : 5, lg: 0 },
                pb: { xs: 10, lg: 0 },
                pl: { lg: 50 },
                WebkitMask: {
                  xs: overlayGradient('bottom'),
                  lg: overlayGradient(rtl ? 'left' : 'right')
                },
                mask: {
                  xs: overlayGradient('bottom'),
                  lg: overlayGradient(rtl ? 'left' : 'right')
                },
                backgroundColor: `${backgroundColor}d9`
              }}
            />
            <OverlayContent
              hasFullscreenVideo={hasFullscreenVideo}
              sx={{
                // This should match width of journey card content in admin
                width: { lg: '312px' },
                maxHeight: { xs: '55vh', lg: '100%' },
                px: { xs: 6, lg: 10 },
                mb: { xs: 28, sm: 16, lg: 0 }
              }}
            >
              {children}
            </OverlayContent>
          </>
        ) : (
          <StyledGradientBackground
            className="overlay-gradient"
            sx={{
              background: {
                xs: `linear-gradient(to top,  ${backgroundColor}ff ${
                  rtl ? 100 : 0
                }%, ${backgroundColor}33 60%, ${backgroundColor}00 100%)`,
                lg: 'unset'
              }
            }}
          />
        )}
      </Stack>
    </>
  )
}
