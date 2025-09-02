import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/ui/container'

export async function AboutSection() {
  const t = await getTranslations('RootIndexPage')

  return (
    <section className="py-12">
      <Container>
        <div className="flex flex-col gap-4">
          <div className="h-1 w-16 bg-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t('pageTitle')}</h2>
          <p className="max-w-3xl text-muted-foreground">{t('description')}</p>
        </div>
      </Container>
    </section>
  )
}

