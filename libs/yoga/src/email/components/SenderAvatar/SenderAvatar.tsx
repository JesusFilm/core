import { Img, Text } from '@react-email/components'
import { ReactElement } from 'react'

import { User } from '../../../../../nest/common/src/lib/firebaseClient'

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
          className="rounded-full border-solid border-2 border-[#FFFFFF] shadow-md"
        />
      ) : (
        <div className="bg-zinc-400 h-[32px] w-[32px] rounded-full border-solid border-2 border-[#FFFFFF] shadow-md">
          <Text className="font-sans font-bold text-[#FFFFFF] m-[5px]">
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
