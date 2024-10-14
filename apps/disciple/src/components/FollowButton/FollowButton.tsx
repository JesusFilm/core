/* eslint-disable i18next/no-literal-string */
/* eslint-disable import/namespace */
import Entypo from '@expo/vector-icons/Entypo'
import { ReactElement } from 'react'

export function FollowButton(): ReactElement {
  return (
    <Entypo.Button
      name="plus"
      size={24}
      color="white"
      backgroundColor="#cb333b"
      borderRadius={15}
      onPress={() => console.log('thanks for the follow')}
    >
      Follow
    </Entypo.Button>
  )
}
