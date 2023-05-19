import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { DetailsForm } from './DetailsForm'
import { VisitorJourneysList } from './VisitorJourneysList'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  return (
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <DetailsForm id={id} />
      </Box>
      <VisitorJourneysList id={id} />
    </>
  )
}
