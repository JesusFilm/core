/* eslint-disable i18next/no-literal-string */
/* eslint-disable import/namespace */

import { Stack } from 'expo-router'
import { ReactElement, useRef } from 'react'
import { Animated, SafeAreaView, ScrollView, Text, View } from 'react-native'

import { BackButton } from '../../src/components/BackButton'
import { ChurchAboutSection } from '../../src/components/ChurchAboutSection'
import { ChurchHeroBanner } from '../../src/components/ChurchHeroBanner'
import { ChurchPageSubheader } from '../../src/components/ChurchPageSubheader'
import { ChurchPopularSection } from '../../src/components/ChurchPopularSection'

export default function ChurchPage(): ReactElement {
  const pan = useRef(new Animated.ValueXY()).current
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => <BackButton />,
          headerTransparent: true
        }}
      />
      <View
        testID="ChurchPageContainer"
        style={{
          backgroundColor: 'black',
          height: '100%',
          width: '100%'
        }}
      >
        <ChurchHeroBanner scrollOffset={pan} />
        <SafeAreaView>
          <ScrollView
            bouncesZoom
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: pan.y } } }],
              { useNativeDriver: false }
            )}
          >
            <Text
              style={{
                marginTop: 200,
                fontSize: 45,
                color: 'white',
                fontWeight: 'bold',
                paddingHorizontal: 20
              }}
            >
              Auckland Ev
            </Text>
            <View
              style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                paddingHorizontal: 20,
                gap: 20
              }}
            >
              <ChurchPageSubheader />
              <ChurchAboutSection />
              <ChurchPopularSection />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  )
}
