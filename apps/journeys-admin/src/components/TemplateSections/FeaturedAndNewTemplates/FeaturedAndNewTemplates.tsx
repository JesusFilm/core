import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

export function FeaturedAndNewTemplates(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { data: featuredData } = useJourneysQuery({
    where: { featured: true, template: true, orderByRecent: true }
  })
  const { data: newData } = useJourneysQuery({
    where: { featured: false, template: true, limit: 10, orderByRecent: true }
  })

  const featuredAndNewTemplates = [
    ...(featuredData?.journeys ?? []),
    ...(newData?.journeys ?? [])
  ]

  return (
    <TemplateSection
      category={t('Featured & New')}
      journeys={featuredAndNewTemplates}
    />
  )
}
