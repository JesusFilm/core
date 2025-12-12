import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/compat/router'
import { useTranslation } from 'next-i18next'
import { type KeyboardEvent, type ReactElement, useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
}

export function BetaBanner(): ReactElement | null {
  const { t } = useTranslation('apps-resources')
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const isWatchRoute = router?.pathname?.startsWith('/watch') ?? false

  useEffect(() => {
    if (!isWatchRoute || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, // Slower horizontal movement
      vy: (Math.random() - 0.5) * 0.2, // Random vertical movement instead of always up
      size: Math.random() * 0.8 + 0.3,
      opacity: Math.random() * 0.4 + 0.2,
      life: Math.random() * 200 + 100 // Longer life for slower movement
    })

    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 200; i++) {
        particlesRef.current.push(createParticle())
      }
    }

    const updateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--

        // Add subtle twinkling effect
        const twinkle = Math.sin(Date.now() * 0.003 + particle.x * 0.01) * 0.1
        particle.opacity = Math.max(0.1, particle.opacity + twinkle * 0.05)

        // Wrap around edges for continuous star-like movement
        if (particle.x < -10) particle.x = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.x = -10
        if (particle.y < -10) particle.y = canvas.height + 10
        if (particle.y > canvas.height + 10) particle.y = -10

        // Respawn when particle dies
        if (particle.life <= 0) {
          particlesRef.current[index] = createParticle()
        }
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
    }

    const animate = () => {
      updateParticles()
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      initParticles()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isWatchRoute])

  if (!isWatchRoute || router == null || !router.isReady) return null

  const activateExperimentalMode = (): void => {
    const isHttps = window.location.protocol === 'https:'
    document.cookie = `EXPERIMENTAL=true; max-age=2592000; path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`
    window.location.reload()
  }

  const handleActivateExperimentalMode = (): void => {
    activateExperimentalMode()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateExperimentalMode()
    }
  }

  return (
    <Box
      role="banner"
      component="section"
      sx={{
        width: '100%',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: '#e53e3e',
          filter: 'saturate(1.1)'
        }
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        role="presentation"
        tabIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      <Container
        sx={{
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Box
          component="button"
          tabIndex={0}
          onClick={handleActivateExperimentalMode}
          onKeyDown={handleKeyDown}
          aria-label={t('Try the new design.')}
          sx={{
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            '&:focus': {
              outline: '2px solid white',
              outlineOffset: '2px'
            }
          }}
        >
          <Typography variant="h6">
            ✨{' '}
            {isMobile
              ? t('Better search, languages, and collections.')
              : t(
                  'Better search. Better language support. Better collections.'
                )}{' '}
            <Box
              component="span"
              sx={{ display: 'inline-block', pr: 4, pl: 2 }}
            >
              →
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {isMobile ? t('New Design') : t('Try the new design.')}
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
