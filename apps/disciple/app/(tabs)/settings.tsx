import { ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function SettingsPage(): ReactElement {
  return (
    <View style={styles.container}>
      <Text>Tab Settings</Text>
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
