import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import i18nConfig from '../next-i18next.config'
import { Roadmap, RoadmapItem } from '../src/components/Roadmap'
import { getRoadmapItems } from '../src/components/Roadmap/getRoadmapItems'

interface RoadmapPageProps {
  items: RoadmapItem[]
}

export default function RoadmapPage({ items }: RoadmapPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo
        title={t('Product Roadmap')}
        description={t('What the NextSteps team is focused on next.')}
      />
      <Roadmap items={items} />
    </>
  )
}

export const getStaticProps: GetStaticProps<RoadmapPageProps> = async ({
  locale
}) => {
  return {
    props: {
      items: getRoadmapItems(),
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
}
