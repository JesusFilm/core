/* eslint-disable import/namespace */
/* eslint-disable i18next/no-literal-string */
import { LinearGradient } from 'expo-linear-gradient'
import { ReactElement } from 'react'
import { Animated, ImageBackground } from 'react-native'

export function ChurchHeroBanner({
  scrollOffset
}: {
  scrollOffset: Animated.ValueXY
}): ReactElement {
  console.log(scrollOffset)
  return (
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
        ],
        opacity: scrollOffset.y.interpolate({
          inputRange: [0, 250],
          outputRange: [1, 0],
          extrapolate: 'clamp'
        })
      }}
    >
      <ImageBackground
        style={{
          position: 'absolute',
          minHeight: 400,
          maxHeight: 800,
          width: '100%',
          zIndex: -2
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
      </ImageBackground>
    </Animated.View>
  )
}
