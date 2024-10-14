import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen'
import { ReactElement, useEffect } from 'react'
import { useColorScheme } from 'react-native'

import { GluestackUIProvider } from '../src/components/ui/gluestack-ui-provider'

import '../global.css'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)'
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
void preventAutoHideAsync()

export default function RootLayout(): ReactElement | null {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error != null) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      void hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav(): ReactElement {
  const colorScheme = useColorScheme()

  return (
    <GluestackUIProvider mode={colorScheme ?? 'light'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/sign-in" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="auth/create-password" />
          <Stack.Screen name="news-feed/news-and-feed" />
          <Stack.Screen name="dashboard/dashboard-layout" />
          <Stack.Screen name="profile/profile" />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  )
}
