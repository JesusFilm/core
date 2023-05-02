import { ReactElement } from 'react'
import { DetailsForm } from './DetailsForm'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  return <DetailsForm id={id} />
}
