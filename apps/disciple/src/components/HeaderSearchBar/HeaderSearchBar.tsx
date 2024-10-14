import { router } from 'expo-router'
import { ReactElement, useState } from 'react'

export function HeaderSearchBar(): ReactElement {
  const [value, setValue] = useState()

  router.setParams({ search: value })
  return <></>
}
