import { ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function HomePage(): ReactElement {
  return (
    <View style={styles.container}>
      <Text>Tab Home</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
