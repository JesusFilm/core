import { Stack } from 'expo-router'
import { ReactElement } from 'react'

import { BackButton } from '../src/components/BackButton'

export default function Layout(): ReactElement {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="church/[churchId]"
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => <BackButton />,
          headerTransparent: true
        }}
      />
    </Stack>
  )
}
