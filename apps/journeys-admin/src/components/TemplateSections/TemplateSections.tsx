import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useJourneysQuery } from '../../libs/useJourneysQuery'

import { TemplateSection } from './TemplateSection'

export function TemplateSections(): ReactElement {
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
    <Stack spacing={8}>
      <TemplateSection
        category="Featured & New"
        journeys={featuredAndNewTemplates}
      />
    </Stack>
  )
}
