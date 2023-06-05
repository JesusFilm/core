import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { DetailsForm } from './DetailsForm'
import { VisitorJourneysList } from './VisitorJourneysList'
import { VisitorDetails } from './VisitorDetails'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  return (
    <Container disableGutters>
      <VisitorDetails id={id} />
      <Box
        sx={{
          display: { sm: 'block', md: 'none' },
          mx: { xs: -6, sm: '-30px', md: 0 }
        }}
      >
        <DetailsForm id={id} />
      </Box>
      <VisitorJourneysList id={id} />
    </Container>
  )
}
