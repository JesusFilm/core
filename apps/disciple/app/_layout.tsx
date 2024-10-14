import { Stack } from 'expo-router'
import { ReactElement } from 'react'

export default function Layout(): ReactElement {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="church/[churchId]" options={{ headerShown: false }} />
    </Stack>
  )
}
