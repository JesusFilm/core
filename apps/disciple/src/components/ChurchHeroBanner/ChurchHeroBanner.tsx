/* eslint-disable i18next/no-literal-string */
import { LinearGradient } from 'expo-linear-gradient'
import { ReactElement } from 'react'
import { ImageBackground, SafeAreaView, Text, View } from 'react-native'

export function ChurchHeroBanner(): ReactElement {
  return (
    <ImageBackground
      style={{
        height: 400,
        width: '100%',
        zIndex: -1
      }}
      source={{
        uri: 'https://assets.aucklandev.co.nz/wp-content/uploads/2014/11/05133409/eviTunesSquare1.jpg'
      }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }}
      />
      <SafeAreaView>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: 'white' }}>Back</Text>
        </View>
      </SafeAreaView>
      <View style={{ marginTop: 'auto', paddingHorizontal: 20 }}>
        <Text
          style={{
            fontSize: 45,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Auckland EV
        </Text>
      </View>
    </ImageBackground>
  )
}
