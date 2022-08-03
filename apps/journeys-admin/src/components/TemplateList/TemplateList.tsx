import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { GetPublicTemplates_journeys as Template } from '../../../__generated__/GetPublicTemplates'
import { TemplateCard } from './TemplateCard'

interface TemplateListProps {
  templates?: Template[]
}

export function TemplateList({ templates }: TemplateListProps): ReactElement {
  return (
    <Box
      sx={{
        pt: 6,
        px: { xs: 0, sm: 8 }
      }}
    >
      {templates != null ? (
        <>
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </>
      ) : (
        <>
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
        </>
      )}
    </Box>
  )
}
