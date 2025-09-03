"use client"

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function SeeAllVideos() {
  const t = useTranslations('RootIndexPage')

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const videosSection = document.getElementById('videos')
    if (videosSection) {
      videosSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <Container className="py-12">
      <div className="flex justify-center">
        <Button
          size="lg"
          className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick(e as any)
            }
          }}
          aria-label={`Scroll to videos section - ${t('ctaSeeAllVideos')}`}
        >
          {t('ctaSeeAllVideos')}
        </Button>
      </div>
    </Container>
  )
}
