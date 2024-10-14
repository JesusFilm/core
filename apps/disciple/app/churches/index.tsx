import { ReactElement } from 'react'
import { SafeAreaView, Text, View } from 'react-native'

export default function Churches(): ReactElement {
  return (
    <SafeAreaView style={{ backgroundColor: 'black' }}>
      <View style={{ backgroundColor: 'black', height: '100%', padding: 20 }}>
        <Text style={{ color: 'white' }}>hello world</Text>
      </View>
    </SafeAreaView>
  )
}
