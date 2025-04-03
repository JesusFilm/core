import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import {
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { BackgroundVideo } from '../ContainedCover/BackgroundVideo'
import { OverlayContent } from '../OverlayContent'
import {
  getFooterMobileHeight,
  getFooterMobileSpacing
} from '../utils/getFooterElements'

interface ParallaxCoverProps {
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

export function ParallaxCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: ParallaxCoverProps): ReactElement {
  const { journey, variant } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const contentRef = useRef() as RefObject<HTMLDivElement>
  const [loading, setLoading] = useState(true)
  const [contentHeight, setContentHeight] = useState(0)
  const footerMobileSpacing = getFooterMobileSpacing({ journey, variant })
  // const footerMobileHeight = getFooterMobileHeight({ journey, variant })

  useEffect(() => {
    if (contentRef.current != null) {
      setContentHeight(
        (contentRef.current as unknown as HTMLDivElement).clientHeight ?? 0
      )
    }
  }, [contentRef, children])

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
        : videoBlock?.video?.images[0]?.mobileCinematicHigh
      : // Use Youtube or Cloudflare set poster image
        videoBlock?.image

  return (
    <Box
      sx={{
        width: '100%',
        top: 0,
        height: '100%',
        position: 'absolute'
      }}
    >
      <Box sx={{ height: '100%', width: '100%' }}>
        {videoBlock?.videoId != null && (
          <BackgroundVideo
            {...videoBlock}
            setLoading={setLoading}
            cardColor={backgroundColor}
          />
        )}
        {/* NextImage poster image causes longer LCP loading times, but still faster since using optimized image */}
        {posterImage != null && videoBlock != null && loading && (
          <NextImage
            data-testid="background-poster-image"
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
              data-testid="background-image"
              src={imageBlock.src ?? backgroundBlur}
              alt={imageBlock.alt}
              placeholder="blur"
              blurDataURL={backgroundBlur}
              layout="fill"
              objectFit="cover"
              sx={{
                transform: 'scale(2) translate(0px, -25%)'
              }}
            />
            <Box
              sx={{
                height: '100%',
                width: '100%',
                WebkitBackdropFilter: 'blur(40px)',
                backdropFilter: 'blur(40px)'
              }}
            />
          </>
        )}

        <Box
          data-testid="footer-blur"
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            WebkitMask: `linear-gradient(${backgroundColor}00 0%, ${backgroundColor}00 50%, ${backgroundColor} calc(100% - ${footerMobileSpacing}), ${backgroundColor} 100%)`,
            mask: `linear-gradient(${backgroundColor}00 0%, ${backgroundColor}00 50%, ${backgroundColor} calc(100% - ${footerMobileSpacing}), ${backgroundColor} 100%)`,
            backgroundColor: `${backgroundColor}f0`
          }}
        />
      </Box>

      <Box
        data-testid="parallax-wrapper"
        sx={{
          width: '100%',
          top: 0,
          height: { xs: `calc(100% - ${footerMobileSpacing})`, sm: '100%' },
          position: 'absolute',
          borderRadius: 'inherit',
          overflowY: 'auto',
          overflowX: 'hidden',
          // Hide on Firefox https://caniuse.com/?search=scrollbar-width
          scrollbarWidth: 'none',
          // Hide on all others https://caniuse.com/?search=webkit-scrollbar
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          WebkitMask: `linear-gradient(transparent 0%, ${backgroundColor} 5%, ${backgroundColor} 95%, transparent 100%)`,
          mask: `linear-gradient(transparent 0%, ${backgroundColor} 5%, ${backgroundColor} 95%, transparent 100%)`,
          perspective: '10px'
        }}
      >
        <Box
          data-testid="parallax-header"
          sx={{
            position: 'absolute',
            zIndex: -1,
            width: '100%',
            height: `calc(100% - ${contentHeight}px + ${
              contentHeight > 0 ? 200 : 0
            }px)`,
            top: `calc(-${contentHeight > 0 ? contentHeight / 2 : 0}px)`,
            objectFit: 'cover',
            transform: 'translateZ(-10px) scale(2)',
            WebkitMask: `linear-gradient(to top, transparent 0%, ${backgroundColor}14 5%, ${backgroundColor}33 10%, ${backgroundColor}60 15%, ${backgroundColor}b0 20%, ${backgroundColor}e6 25%, ${backgroundColor} 30%)`,
            mask: `linear-gradient(to top, transparent 0%, ${backgroundColor}14 5%, ${backgroundColor}33 10%, ${backgroundColor}60 15%, ${backgroundColor}b0 20%, ${backgroundColor}e6 25%, ${backgroundColor} 30%)`
          }}
        >
          {imageBlock != null && backgroundBlur != null && (
            <NextImage
              data-testid="content-background-image"
              src={imageBlock.src ?? backgroundBlur}
              alt={imageBlock.alt}
              placeholder="blur"
              blurDataURL={backgroundBlur}
              layout="fill"
              objectFit="cover"
            />
          )}
        </Box>

        {children.length !== 0 ? (
          <Box
            ref={contentRef}
            data-testid="parallax-content"
            sx={{
              position: 'absolute',
              bottom: '0px',
              maxHeight: '50vh',
              width: '100%'
            }}
          >
            <OverlayContent
              hasFullscreenVideo={false}
              sx={{
                pt: 20,
                WebkitMask: `linear-gradient(transparent 0%, ${backgroundColor} 80px,  ${backgroundColor} 100%)`,
                mask: `linear-gradient(transparent 0%, ${backgroundColor} 80px,  ${backgroundColor} 100%)`,
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
                backgroundColor: `${backgroundColor}80`,
                width: { sm: '312px' }
              }}
            >
              {children}
            </OverlayContent>
          </Box>
        ) : (
          <StyledGradientBackground
            className="overlay-gradient"
            sx={{
              background: {
                xs: `linear-gradient(to top,  ${backgroundColor}80 ${
                  rtl ? 100 : 0
                }%, ${backgroundColor}33 60%, ${backgroundColor}00 100%)`,
                sm: 'unset'
              }
            }}
          />
        )}
      </Box>
    </Box>
  )
}
