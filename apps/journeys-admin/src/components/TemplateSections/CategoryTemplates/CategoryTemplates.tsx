import { ReactElement } from 'react'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

interface CategoryTemplatesProps {
  id: string
  name: string
  filtered?: boolean
}

export function CategoryTemplates({
  id,
  name,
  filtered
}: CategoryTemplatesProps): ReactElement {
  const { data } = useJourneysQuery({
    where: {
      template: true,
      orderByRecent: true,
      tagIds: [id]
    }
  })

  function getJourneysLength(length): boolean {
    return data?.journeys != null && data?.journeys.length > length
  }

  const renderTemplates =
    (filtered === true && getJourneysLength(0)) || getJourneysLength(4)

  return (
    <>
      {renderTemplates && (
        <TemplateSection category={name} journeys={data?.journeys} />
      )}
    </>
  )
}
