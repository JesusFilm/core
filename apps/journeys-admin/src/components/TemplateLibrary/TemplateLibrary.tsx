import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { GetPublishedTemplates_journeys as Journey } from '../../../__generated__/GetPublishedTemplates'
import { TemplateCard } from '../TemplateCard'

interface TemplateLibraryProps {
  journeys?: Journey[]
}

export function TemplateLibrary({
  journeys
}: TemplateLibraryProps): ReactElement {
  return (
    <Container
      sx={{
        pt: 6,
        px: { xs: 0, sm: 8 }
      }}
    >
      {journeys != null ? (
        <>
          {journeys.map((journey) => (
            <TemplateCard key={journey.id} journey={journey} />
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
