import PlayArrow from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { CarouselMuxSlide } from '../../types/inserts'

import { MuxVideoFallback } from './MuxVideoFallback'

interface MuxVideoCardProps {
  insert: CarouselMuxSlide
  variant?: 'contained' | 'expanded'
}

const Container = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  aspectRatio: '16 / 9'
}))

const Overlay = styled('div')<{ variant: 'contained' | 'expanded' }>(({ theme, variant }) => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: theme.spacing(4),
  background:
    variant === 'contained'
      ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.8) 100%)'
      : 'linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.6) 100%)',
  color: theme.palette.primary.contrastText,
  pointerEvents: 'none'
}))

const PosterLayer = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: theme.palette.common.black,
  transition: theme.transitions.create('opacity', { duration: 600 }),
  backgroundSize: 'cover',
  backgroundPosition: 'center center'
}))

export function MuxVideoCard({ insert, variant = 'expanded' }: MuxVideoCardProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [userInitiatedPlay, setUserInitiatedPlay] = useState(false)

  const poster = insert.posterOverride ?? insert.urls.poster

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

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

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === node) {
          setIsIntersecting(entry.isIntersecting)
        }
      })
    }, { threshold: 0.6 })

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

  const handleManualPlay = (): void => {
    setUserInitiatedPlay(true)
    const video = videoRef.current
    if (video != null) {
      video.muted = true
      void video.play().catch(() => {})
    }
  }

  if (hasError) {
    return <MuxVideoFallback overlay={insert.overlay} variant={variant} />
  }

  const showPoster =
    !isLoaded || (prefersReducedMotion === true && userInitiatedPlay !== true)

  return (
    <Container ref={containerRef} data-testid="MuxVideoCard">
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
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
      </Box>

      <Overlay variant={variant}>
        <Stack spacing={1} sx={{ pointerEvents: 'auto' }}>
          <Typography variant="overline2" component="p">
            {insert.overlay.label}
          </Typography>
          <Typography component="h3" variant="h5" fontWeight={700}>
            {insert.overlay.title}
          </Typography>
          <Typography variant="subtitle2" component="p" sx={{ opacity: 0.8 }}>
            {insert.overlay.collection}
          </Typography>
          <Typography variant="body2" component="p" sx={{ maxWidth: 420 }}>
            {insert.overlay.description}
          </Typography>
          {prefersReducedMotion === true && userInitiatedPlay !== true && (
            <Button
              onClick={handleManualPlay}
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<PlayArrow />}
              sx={{ mt: 2, alignSelf: 'flex-start', pointerEvents: 'auto' }}
            >
              Play background video
            </Button>
          )}
        </Stack>
      </Overlay>
    </Container>
  )
}
