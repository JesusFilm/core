import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { TemplateCard } from './TemplateCard'

interface TemplateListProps {
  templates: Template[]
}

// todo replace with templateJourney generated type
export interface Template {
  id: string
  title: string
  date: string
  description: string
  socialShareImage: string
}

export function TemplateList({ templates }: TemplateListProps): ReactElement {
  return (
    <Box
      sx={{
        pt: 6,
        px: { xs: 0, sm: 8 }
      }}
    >
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </Box>
  )
}
