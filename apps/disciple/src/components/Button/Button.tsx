import { ReactElement } from 'react'
import { Pressable, Text } from 'react-native'

interface ButtonProps {
  title: string
  onPress?: () => void
}

export function Button({ title, onPress }: ButtonProps): ReactElement {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: 8,
          elevation: 3,
          backgroundColor: 'black',
          opacity: pressed ? 0.7 : 1
        }
      ]}
      onPress={() => {
        onPress?.()
      }}
    >
      <Text
        disabled
        style={{
          fontSize: 16,
          lineHeight: 21,
          fontWeight: 'bold',
          letterSpacing: 0.25,
          color: 'white'
        }}
      >
        {title}
      </Text>
    </Pressable>
  )
}
