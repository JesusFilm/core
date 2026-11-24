import { ReactElement } from 'react'

import { Spinner } from '@/components/ui/spinner'

export default function Loading(): ReactElement {
  return (
    <div className="grid h-full w-full place-items-center p-8">
      <Spinner aria-label="Loading" />
    </div>
  )
}
