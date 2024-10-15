import Feather from '@expo/vector-icons/Feather'
import { Stack, Tabs } from 'expo-router'
import { ReactElement } from 'react'

export default function TabLayout(): ReactElement {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs screenOptions={{ tabBarActiveTintColor: '#EF3340' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather size={size} name="home" color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Feather size={size} name="settings" color={color} />
            )
          }}
        />
      </Tabs>
    </>
  )
}
