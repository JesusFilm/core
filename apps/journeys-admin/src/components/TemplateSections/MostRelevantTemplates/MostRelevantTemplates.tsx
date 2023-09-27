import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

export function MostRelevantTemplates(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const tags = router.query.tags as string[]

  const { data } = useJourneysQuery({
    where: { template: true, orderByRecent: true, tagIds: tags }
  })

  return (
    <TemplateSection category={t('Most Relevant')} journeys={data?.journeys} />
  )
}
