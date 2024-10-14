/* eslint-disable import/namespace */
/* eslint-disable i18next/no-literal-string */
import { LinearGradient } from 'expo-linear-gradient'
import { ReactElement } from 'react'
import {
  Animated,
  ImageBackground,
  SafeAreaView,
  Text,
  View
} from 'react-native'

import { BackButton } from '../BackButton'

export function ChurchHeroBanner({
  scrollOffset
}: {
  scrollOffset: Animated.ValueXY
}): ReactElement {
  console.log(scrollOffset)
  return (
    <>
      <Animated.View
        style={{
          transform: [
            {
              translateY: scrollOffset.y.interpolate({
                inputRange: [-1000, 0],
                outputRange: [-100, 0],
                extrapolate: 'clamp'
              })
            },
            {
              scale: scrollOffset.y.interpolate({
                inputRange: [-3000, 0],
                outputRange: [20, 1],
                extrapolate: 'clamp'
              })
            }
          ]
        }}
      >
        <ImageBackground
          style={{
            minHeight: 400,
            maxHeight: 800,
            width: '100%',
            zIndex: -1
          }}
          resizeMode="stretch"
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
              <BackButton />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </Animated.View>
      <Text
        style={{
          marginTop: -60,
          fontSize: 45,
          color: 'white',
          fontWeight: 'bold',
          paddingHorizontal: 20
        }}
      >
        Auckland EV
      </Text>
    </>
  )
}
