import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { TemplateCard } from '../TemplateCard'

interface TemplateLibraryProps {
  templates?: Journey[]
}

export function TemplateLibrary({
  templates
}: TemplateLibraryProps): ReactElement {
  return (
    <Box sx={{ mx: { xs: -6, sm: 0 } }}>
      <Container disableGutters>
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
    </Box>
  )
}
