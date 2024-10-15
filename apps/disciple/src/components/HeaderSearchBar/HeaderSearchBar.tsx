import { router } from 'expo-router'
import { ReactElement, useState } from 'react'

export function HeaderSearchBar(): ReactElement | null {
  const [value] = useState()

  router.setParams({ search: value })
  return null
}
