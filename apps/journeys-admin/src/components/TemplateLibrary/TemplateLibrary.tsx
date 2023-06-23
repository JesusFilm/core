import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { TemplateCard } from '../TemplateCard'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'

export function TemplateLibrary(): ReactElement {
  const { data } = useAdminJourneysQuery({ template: true })

  return (
    <Box sx={{ mx: { xs: -6, sm: 0 } }}>
      <Container disableGutters>
        {data?.journeys != null ? (
          <>
            {data?.journeys.map((template) => (
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
