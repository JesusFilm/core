import { LinearGradient } from 'expo-linear-gradient'
import { ReactElement } from 'react'
import { ImageBackground, Text, View } from 'react-native'

export function ChurchAboutSection(): ReactElement {
  return (
    <View
      style={{
        display: 'flex',
        gap: 20
      }}
    >
      <Text
        style={{
          fontSize: 25,
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        About
      </Text>
      <View
        style={{
          //   height: 380,
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        <ImageBackground
          style={{
            height: 300,
            width: '100%',
            zIndex: -1
          }}
          source={{
            uri: 'https://assets.aucklandev.co.nz/wp-content/uploads/2022/04/02115300/ministry-background.jpg'
          }}
        >
          <View style={{ padding: 20, height: '100%' }}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
              }}
            />
            <Text
              style={{
                color: 'white',
                marginTop: 'auto'
              }}
            >
              We are a bunch of people in Auckland, convinced we’re not perfect,
              captivated by the historical Jesus, excited about the future he
              offers, and eager to authentically share this hope.
            </Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  )
}
