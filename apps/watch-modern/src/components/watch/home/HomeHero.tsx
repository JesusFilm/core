import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { HeroOverlay } from './HeroOverlay'

import { Container } from '@/components/ui/container'

export async function HomeHero() {
  const t = await getTranslations('RootIndexPage')

  return (
    <section className="relative isolate">
      <div className="relative h-[50svh] min-h-[420px] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/watch/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-70"
        />
        <HeroOverlay />
      </div>

      <Container className="relative -mt-24 z-20">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            <span dangerouslySetInnerHTML={{ __html: t('title') }} />
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">{t('description')}</p>
        </div>
      </Container>
    </section>
  )
}
