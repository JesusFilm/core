import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { HeroOverlay } from './HeroOverlay'

import { Container } from '@/components/ui/container'

export async function HomeHero() {
  const t = await getTranslations('RootIndexPage')

  return (
    <section className="relative isolate">
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-neutral-950">
                <Image
          src="/watch/hero.jpg"
          alt="Jesus Film Project"
        fill
        priority
        className="object-cover"
      />
        <HeroOverlay />
      </div>

      <Container className="relative -mt-16 z-20">
        <div className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
                {t('freeGospelVideo')}{' '}
                <span className="underline decoration-white decoration-2 underline-offset-4">
                  {t('streaming')}
                </span>{' '}
                {t('library')}
              </h1>
            </div>
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-white/90 md:text-2xl leading-relaxed">{t('description')}</h2>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
