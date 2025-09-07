import { getTranslations } from 'next-intl/server'
import { getCarouselVideos } from '@/server/getCarouselVideos'
import { HomeVideoCarousel } from './HomeVideoCarousel'
import { Container } from '@/components/ui/container'
import homeCarouselSlugs from '@/data/home-carousel-slugs.json'

/**
 * Home Hero Component
 * Renders the video carousel with fallback to static content
 */
export async function HomeHero() {
  const t = await getTranslations('RootIndexPage')

  console.log('🏠 [DEBUG] HomeHero component starting...')

  // Fetch carousel videos on server side using curated slugs from JSON
  const curatedSlugs = homeCarouselSlugs

  console.log('🏠 [DEBUG] About to fetch carousel videos with', curatedSlugs.length, 'slugs from JSON file')
  console.log('🏠 [DEBUG] Slugs from JSON:', curatedSlugs.map(s => s.slug))

  const carouselVideos = await getCarouselVideos(
    curatedSlugs,
    'en', // Default locale for now
    5
  )

  console.log('🏠 [DEBUG] Carousel videos fetch complete:', {
    videosFetched: carouselVideos.length,
    willShowCarousel: carouselVideos.length > 0,
    videoTitles: carouselVideos.map(v => v.title)
  })

  const watchUrl = process.env.NEXT_PUBLIC_WATCH_URL || 'https://www.jesusfilm.org/watch'
  console.log('🏠 [DEBUG] Watch URL:', watchUrl)

  console.log('🏠 [DEBUG] Rendering decision:', {
    showingCarousel: carouselVideos.length > 0,
    videosCount: carouselVideos.length,
    fallbackImagePath: '/watch/hero.jpg'
  })

  return (
    <section className="relative isolate">
      {/* Video Carousel or Fallback */}
      {carouselVideos.length > 0 ? (
        <>
          {console.log('🎬 [DEBUG] Rendering video carousel with', carouselVideos.length, 'videos')}
          <HomeVideoCarousel videos={carouselVideos} watchUrl={watchUrl} />
        </>
      ) : (
        <>
          {console.log('🖼️ [DEBUG] Rendering fallback static hero image')}
          <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-neutral-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/watch/hero.jpg"
              alt="Jesus Film Project"
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay matching carousel theme */}
            <div className="absolute inset-0 carousel-gradient-normal" />
          </div>
        </>
      )}

      {/* Content below hero */}
      <Container className="relative z-20 pointer-events-none">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl pointer-events-auto">
                {t('freeGospelVideo')}{' '}
                <span className="underline decoration-white decoration-2 underline-offset-4">
                  {t('streaming')}
                </span>{' '}
                {t('library')}
              </h1>
            </div>
            <div className="flex items-center pointer-events-auto">
              <h2 className="text-xl font-semibold text-white/90 md:text-2xl leading-relaxed">{t('description')}</h2>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
