import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { TemplateCard } from '../TemplateCard'

interface TemplateLibraryProps {
  isPublisher?: boolean
  templates?: Journey[]
}

export function TemplateLibrary({
  templates
}: TemplateLibraryProps): ReactElement {
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
            <TemplateCard key={template.id} journey={template} />
          ))}
        </>
      ) : (
        <>
          {[1, 2, 3].map((index) => (
            <TemplateCard key={`templateCard${index}`} />
          ))}
        </>
      )}
    </Container>
  )
}
