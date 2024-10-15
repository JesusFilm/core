import { Stack } from 'expo-router'
import { ReactElement } from 'react'
import { SafeAreaView, Text, View } from 'react-native'

import { BackButton } from '../../src/components/BackButton'

export default function Churches(): ReactElement {
  return (
    <SafeAreaView style={{ backgroundColor: 'black' }}>
      <Stack.Screen
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
      <View style={{ backgroundColor: 'black', height: '100%', padding: 20 }}>
        <Text style={{ color: 'white' }}>hello world</Text>
      </View>
    </SafeAreaView>
  )
}
