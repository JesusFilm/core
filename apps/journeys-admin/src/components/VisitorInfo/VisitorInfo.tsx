import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { DetailsForm } from './DetailsForm'
import { VisitorJourneysList } from './VisitorJourneysList'
import { VisitorDetails } from './VisitorDetails'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  return (
    <>
      <VisitorDetails id={id} />
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <DetailsForm id={id} />
      </Box>
      <VisitorJourneysList id={id} />
    </>
  )
}
