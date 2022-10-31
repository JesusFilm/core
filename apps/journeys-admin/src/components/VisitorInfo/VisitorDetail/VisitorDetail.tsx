import { ReactElement } from 'react'
import { VisitorJourneyList } from '../VisitorJourneyList'
import { VisitorDetailForm } from './VisitorDetailForm'

interface Props {
  id: string
}

export function VisitorDetail({ id }: Props): ReactElement {
  return (
    <>
      <VisitorDetailForm id={id} />
      <VisitorJourneyList id={id} limit={1} />
    </>
  )
}
