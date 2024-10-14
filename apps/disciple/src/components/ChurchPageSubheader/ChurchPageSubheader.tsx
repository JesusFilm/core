import { ReactElement } from 'react'
import { View } from 'react-native'
import { ChurchMemberCount } from '../ChurchMemberCount'
import { FollowButton } from '../FollowButton'

export function ChurchPageSubheader(): ReactElement {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <ChurchMemberCount />
      <FollowButton />
    </View>
  )
}
