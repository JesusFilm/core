import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useJourneysQuery } from '../../libs/useJourneysQuery'

import { TemplateSection } from './TemplateSection'

export function TemplateSections(): ReactElement {
  // featuredData, replace once journeys have been decided
  const { data: featuredData } = useJourneysQuery({
    where: { featured: true, template: false }
  })
  const { data: newData } = useJourneysQuery({
    where: { template: true }
  })

  const featuredAndNewJourneys = [
    ...(featuredData?.journeys ?? []),
    ...(newData?.journeys ?? [])
  ]

  return (
    <Stack spacing={8}>
      <TemplateSection
        category="Featured & New"
        journeys={featuredAndNewJourneys}
      />
      {/* Add more template categories */}
    </Stack>
  )
}
