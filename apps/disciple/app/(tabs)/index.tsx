import { router } from 'expo-router'
import { ReactElement } from 'react'
import { StyleSheet, View } from 'react-native'

import { Button } from '../../src/components/Button'

export default function HomePage(): ReactElement {
  return (
    <View style={styles.container}>
      <Button
        title="To church/[churchId]"
        onPress={() => {
          router.push({
            pathname: '/church/[churchId]',
            params: { churchId: 'aucklandEv' }
          })
        }}
      />
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
