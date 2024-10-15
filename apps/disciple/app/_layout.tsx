import { Stack } from 'expo-router'
import { ReactElement } from 'react'

import { GluestackUIProvider } from '../src/components/ui/gluestack-ui-provider'

import '../global.css'

export default function Layout(): ReactElement {
  return (
    <GluestackUIProvider>
      <Stack />
    </GluestackUIProvider>
  )
}
