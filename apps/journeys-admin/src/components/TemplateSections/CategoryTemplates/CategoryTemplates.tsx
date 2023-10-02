import { ReactElement } from 'react'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

interface CategoryTemplatesProps {
  id: string
  name: string
}

export function CategoryTemplates({
  id,
  name
}: CategoryTemplatesProps): ReactElement {
  const { data } = useJourneysQuery({
    where: {
      template: true,
      orderByRecent: true,
      tagIds: [id]
    }
  })

  const renderTemplates = data?.journeys != null && data?.journeys.length >= 5

  return (
    <>
      {renderTemplates && (
        <TemplateSection category={name} journeys={data?.journeys} />
      )}
    </>
  )
}
