import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ReactElement } from 'react'

import { useJourneysQuery } from '../../libs/useJourneysQuery'
import { TemplateCard } from '../TemplateCard'

export function TemplateLibrary(): ReactElement {
  const { data } = useJourneysQuery({ where: { template: true } })

  return (
    <Box
      sx={{ mx: { xs: -6, sm: 0 } }}
      data-testid="JourneysAdminTemplateLibrary"
    >
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
