import { Stack } from 'expo-router'
import { ReactElement } from 'react'
import { Text } from 'react-native'

import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'
import { BackButton } from '../src/components/BackButton'

import Churches from './churches'

import '../global.css'

export default function Layout(): ReactElement {
  return (
    <GluestackUIProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="churches/index"
          options={{
            headerShown: true,
            headerTitle: () => (
              <Text style={{ color: 'white' }}>search bar here</Text>
            ),
            headerRight: () => <BackButton />,
            headerBackVisible: false,
            headerTransparent: true
          }}
        />
        <Stack.Screen
          name="churches/[churchId]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerLeft: () => <BackButton />,
            headerTransparent: true
          }}
        />
      </Stack>
    </GluestackUIProvider>
  )
}
