/* eslint-disable import/namespace */
/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'
import { View } from 'react-native'

import { ChurchHeroBanner } from '../../src/components/ChurchHeroBanner'
import { FollowButton } from '../../src/components/FollowButton'
import { ChurchMemberCount } from '../../src/components/ChurchMemberCount'
import { ChurchPageSubheader } from '../../src/components/ChurchPageSubheader'

export default function ChurchPage(): ReactElement {
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
      <ChurchHeroBanner />

      <View
        style={{
          height: '100%',
          width: '100%',
          paddingHorizontal: 20
        }}
      >
        <ChurchPageSubheader />
      </View>
    </View>
  )
}
