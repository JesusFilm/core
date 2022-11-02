import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { VisitorJourneyList } from '../VisitorJourneyList'
import { VisitorDetailForm } from './VisitorDetailForm'

interface Props {
  id: string
}

export function VisitorDetail({ id }: Props): ReactElement {
  return (
    <Box pt={4}>
      <VisitorDetailForm id={id} />
      <VisitorJourneyList id={id} limit={1} />
    </Box>
  )
}
