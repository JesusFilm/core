import { ReactElement } from 'react'
import { VisitorDetail } from './VisitorDetail'
import { VisitorInfoProvider } from './VisitorInfoProvider'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  return (
    <VisitorInfoProvider>
      <VisitorDetail id={id} />
    </VisitorInfoProvider>
  )
}
