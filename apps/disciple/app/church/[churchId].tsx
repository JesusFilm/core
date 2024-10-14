/* eslint-disable import/namespace */
/* eslint-disable i18next/no-literal-string */
import { LinearGradient } from 'expo-linear-gradient'
import { ReactElement } from 'react'
import { Text, View } from 'react-native'

import { ChurchHeroBanner } from '../../src/components/ChurchHeroBanner'
import { FollowButton } from '../../src/components/FollowButton'

export default function ChurchPage(): ReactElement {
  return (
    <View testID="ChurchPageContainer" style={{ display: 'flex' }}>
      <ChurchHeroBanner />
      <View>
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0)']}
          style={{
            height: '100%',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }}
        />
        <View
          style={{
            backgroundColor: 'black',
            height: '100%',
            width: '100%',
            paddingHorizontal: 20
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, lineHeight: 20 }}>
              700+ members
            </Text>
            <FollowButton />
          </View>
          {/* <Text style={{ color: 'white' }}>About</Text> */}
        </View>
      </View>
    </View>
  )
}
