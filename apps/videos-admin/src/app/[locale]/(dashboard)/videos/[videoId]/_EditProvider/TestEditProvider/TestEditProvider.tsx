import { ReactElement } from 'react'

import { useEdit } from '../EditProvider'

export function TestEditProvider(): ReactElement {
  const { state } = useEdit()
  return (
    <>
      <div>{`isEdit: ${state.isEdit}`}</div>
    </>
  )
}
