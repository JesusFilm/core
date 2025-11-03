import { Img, Text } from '@react-email/components'
import { ReactElement } from 'react'

import { User } from '../../../firebaseClient'

interface SenderAvatarProps {
  sender: Omit<User, 'id' | 'email' | 'emailVerified'>
}

export function SenderAvatar({ sender }: SenderAvatarProps): ReactElement {
  return (
    <>
      {sender?.imageUrl != null ? (
        <Img
          src={sender.imageUrl ?? ''}
          alt={sender?.firstName}
          width={32}
          height={32}
          className="rounded-full border-2 border-solid border-[#FFFFFF] shadow-md"
        />
      ) : (
        <div className="h-[32px] w-[32px] rounded-full border-2 border-solid border-[#FFFFFF] bg-zinc-400 shadow-md">
          <Text className="m-[5px] font-sans font-bold text-[#FFFFFF]">
            {sender.firstName.at(0)}
          </Text>
        </div>
      )}
    </>
  )
}

SenderAvatar.PreviewProps = {
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl: undefined
  }
} satisfies SenderAvatarProps

export default SenderAvatar
