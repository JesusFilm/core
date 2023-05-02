import { ReactElement } from 'react'
import { DetailsForm } from './DetailsForm'
import { VisitorJourneysList } from './VisitorJourneysList'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  return (
    <>
      <DetailsForm id={id} />
      <VisitorJourneysList id={id} />
    </>
  )
}
