import { ReactElement } from 'react'

import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

interface CategoryTemplateProps {
  id: string
  name?: string
}

export function CategoryTemplates({
  id,
  name
}: CategoryTemplateProps): ReactElement {
  const { data } = useJourneysQuery({
    where: {
      template: true,
      orderByRecent: true,
      tagIds: [id]
    }
  })

  const paramName = data?.journeys[0]?.tags
    .find((tag) => tag.id === id)
    ?.name.find(({ primary }) => primary)?.value

  return (
    <TemplateSection
      category={name != null ? name : paramName ?? ''}
      journeys={data?.journeys}
    />
  )
}
