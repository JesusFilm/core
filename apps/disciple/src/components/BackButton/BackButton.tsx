/* eslint-disable import/namespace */
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { ReactElement } from 'react'
import { Pressable, StyleSheet } from 'react-native'

export function BackButton(): ReactElement {
  return (
    <Pressable style={{ width: 50, borderRadius: 30 }}>
      {({ pressed }) => (
        <Ionicons
          name="chevron-back-circle"
          size={30}
          color="white"
          backgroundColor="transparent"
          style={{ ...styles.button }}
          onPress={router.back}
        />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 0
  }
})
