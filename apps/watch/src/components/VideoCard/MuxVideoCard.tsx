import PlayArrow from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { type SxProps, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import type { MouseEvent, ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { CarouselMuxSlide } from '../../types/inserts'

import { MuxVideoFallback } from './MuxVideoFallback'

interface MuxVideoCardProps {
  insert: CarouselMuxSlide
  variant?: 'contained' | 'expanded'
  active?: boolean
  imageSx?: SxProps
  onClick?: (videoId?: string) => (event: MouseEvent) => void
}

const ImageButton = styled(ButtonBase)(() => ({
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

const PosterLayer = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: theme.palette.common.black,
  transition: theme.transitions.create('opacity', { duration: 600 }),
  backgroundSize: 'cover',
  backgroundPosition: 'center center'
}))

export function MuxVideoCard({
  insert,
  variant = 'expanded',
  active,
  imageSx,
  onClick: handleClick
}: MuxVideoCardProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [userInitiatedPlay, setUserInitiatedPlay] = useState(false)

  const poster = insert.posterOverride ?? insert.urls.poster
  // For mux inserts, we'll use a placeholder href since they don't navigate to specific videos
  const href = '#'

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

    handleChange()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const node = containerRef.current
    if (node == null) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === node) {
            setIsIntersecting(entry.isIntersecting)
          }
        })
      },
      { threshold: 0.6 }
    )

    observer.observe(node)

    return () => {
      observer.unobserve(node)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video == null) return

    if (hasError) {
      video.pause()
      return
    }

    if (prefersReducedMotion && !userInitiatedPlay) {
      video.pause()
      return
    }

    if (isIntersecting || userInitiatedPlay) {
      video.muted = true
      const playPromise = video.play()
      if (playPromise != null) {
        void playPromise.catch(() => {})
      }
    } else {
      video.pause()
    }
  }, [hasError, isIntersecting, prefersReducedMotion, userInitiatedPlay])

  useEffect(() => {
    return () => {
      const video = videoRef.current
      video?.pause()
    }
  }, [])

  if (hasError) {
    return (
      <MuxVideoFallback
        overlay={insert.overlay}
        variant={variant}
        onVideoSelect={(videoId) =>
          handleClick?.(videoId)?.(new MouseEvent('click') as any)
        }
        videoId={insert.id}
      />
    )
  }

  const showPoster =
    !isLoaded || (prefersReducedMotion === true && userInitiatedPlay !== true)

  return (
    <Link
      component={NextLink}
      href={href}
      display="block"
      underline="none"
      color="inherit"
      aria-label="VideoCard"
      data-testid={`VideoCard-${insert.id}`}
      onClick={handleClick?.(insert.id)}
      locale={false}
    >
      <Stack spacing={3}>
        <ImageButton
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
            ref={containerRef}
          >
            <PosterLayer
              sx={{
                opacity: showPoster ? 1 : 0,
                backgroundImage: `url(${poster})`
              }}
            />
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
              autoPlay={!prefersReducedMotion}
              aria-hidden="true"
              onCanPlay={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            >
              <source src={insert.urls.hls} type="application/x-mpegURL" />
              {insert.urls.mp4?.medium != null && (
                <source src={insert.urls.mp4.medium} type="video/mp4" />
              )}
              {insert.urls.mp4?.high != null && (
                <source src={insert.urls.mp4.high} type="video/mp4" />
              )}
            </video>
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
                fontWeight="bold"
                fontSize={21}
                lineHeight={27 / 21}
                sx={{
                  textAlign: 'left',
                  textShadow:
                    '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 2px 3px rgba(0, 0, 0, 0.45)'
                }}
              >
                {insert.overlay.title}
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
                color="primary.main"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  lineHeight: '29px'
                }}
              >
                {variant === 'contained' && insert.overlay.label}
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
                    <Typography variant="h6">Playing now</Typography>
                  </>
                ) : (
                  <>
                    <PlayArrow sx={{ fontSize: '1rem' }} />
                    <Typography variant="h6">
                      {insert.overlay.collection}
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>
          </Layer>
        </ImageButton>
        {variant === 'expanded' && (
          <>
            <Typography variant="overline2" sx={{ opacity: 0.5 }}>
              {insert.overlay.label}
            </Typography>
            <Typography
              color="textPrimary"
              variant="h6"
              component="h3"
              fontWeight="bold"
              fontSize={21}
              lineHeight={27 / 21}
            >
              {insert.overlay.title}
            </Typography>
          </>
        )}
      </Stack>
    </Link>
  )
}
