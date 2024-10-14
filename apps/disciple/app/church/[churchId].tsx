/* eslint-disable import/namespace */
/* eslint-disable i18next/no-literal-string */
import { ReactElement, useRef } from 'react'

import { View, ImageBackground, ScrollView, Animated } from 'react-native'

import { ChurchHeroBanner } from '../../src/components/ChurchHeroBanner'
import { ChurchPageSubheader } from '../../src/components/ChurchPageSubheader'
import { ChurchAboutSection } from '../../src/components/ChurchAboutSection'
import { ChurchPopularSection } from '../../src/components/ChurchPopularSection'

export default function ChurchPage(): ReactElement {
  const pan = useRef(new Animated.ValueXY()).current
  return (
    <View
      testID="ChurchPageContainer"
      style={{
        display: 'flex',
        backgroundColor: 'black',
        height: '100%',
        width: '100%'
      }}
    >
      <ScrollView
        bouncesZoom
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: pan.y } } }],
          { useNativeDriver: false }
        )}
      >
        <ChurchHeroBanner scrollOffset={pan} />
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
    </View>
  )
}
