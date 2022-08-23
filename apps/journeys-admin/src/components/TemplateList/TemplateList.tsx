import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { GetPublishedTemplates_journeys as Journey } from '../../../__generated__/GetPublishedTemplates'
import { TemplateCard } from '../TemplateCard'

interface TemplateListProps {
  journeys?: Journey[]
}

export function TemplateList({ journeys }: TemplateListProps): ReactElement {
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
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
        </>
      )}
    </Container>
  )
}
