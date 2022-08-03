import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { GetPublicTemplates_journeys as Template } from '../../../__generated__/GetPublicTemplates'
import { TemplateCard } from './TemplateCard'

interface TemplateListProps {
  templates?: Template[]
}

// TODO update journeyCard menu
// TODO add link to get to template list to page wrapper

// TODO add link to templateCard to /templates/[journeyId]
// TODO scroll to duplicated template

export function TemplateList({ templates }: TemplateListProps): ReactElement {
  return (
    <Container
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
    </Container>
  )
}
