import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

interface Props {
  tags?: string[]
}

export function MostRelevantTemplates({ tags }: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { data } = useJourneysQuery({
    where: { template: true, orderByRecent: true, tagIds: tags }
  })

  return (
    <TemplateSection category={t('Most Relevant')} journeys={data?.journeys} />
  )
}
