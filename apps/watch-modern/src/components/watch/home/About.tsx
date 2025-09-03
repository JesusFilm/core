import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/ui/container'

export async function AboutSection() {
  const t = await getTranslations('RootIndexPage')

  return (
    <section
      className="py-16 mt-8"
      aria-labelledby="about-heading"
    >
      <Container>
        <div className="flex flex-col gap-6">
          <div className="h-1 w-20 bg-primary" aria-hidden="true" />
          <h2
            id="about-heading"
            className="text-3xl font-extrabold tracking-tight md:text-4xl"
          >
            {t('pageTitleAbout')}
          </h2>
          <p className="max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t('descriptionAbout')}
          </p>
        </div>
      </Container>
    </section>
  )
}

