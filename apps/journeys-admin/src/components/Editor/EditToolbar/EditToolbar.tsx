import { ReactElement } from 'react'
import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  return (
    <>
      <DeleteBlock variant="button" />
      <Menu />
    </>
  )
}
