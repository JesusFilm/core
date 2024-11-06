import { Column, Img, Row, Section, Text } from '@react-email/components'
import { ReactElement } from 'react'

import { User } from '../../../../firebaseClient'

interface ActionSenderProps {
  sender: Omit<User, 'id' | 'emailVerified'>
  variant: 'sharedWithMe' | 'accessRequest'
}

export function ActionSender({
  sender,
  variant
}: ActionSenderProps): ReactElement {
  return (
    <Section align="center">
      <Row className="my-[20px]">
        <Column align="right" className="pr-[10px]">
          {sender?.imageUrl != null ? (
            <Img
              src={sender.imageUrl ?? ''}
              alt={sender?.firstName}
              width={60}
              height={60}
              className="rounded-full shadow-md border-[#FFFFFF]"
            />
          ) : (
            <div className="bg-zinc-400 h-[60px] w-[60px] rounded-full border-solid border-2 border-[#FFFFFF] shadow-md">
              <Text className="font-sans font-bold text-center text-[#FFFFFF] text-3xl mt-[12px] mr-[1px]">
                {sender.firstName.at(0)}
              </Text>
            </div>
          )}
        </Column>
        <Column align="left" className="pl-[10px]">
          {sender.firstName != null && (
            <Text className="font-sans text-[16px] leading-[24px] font-semibold m-[0px]">
              {`${sender.firstName}`}
            </Text>
          )}
          {sender.email != null && (
            <Text className="font-sans text-[14px] leading-[24px] font-normal m-[0px]">
              {`${sender.email}`}
            </Text>
          )}
          <Text className="font-sans text-[16px] leading-[24px] font-semibold m-[0px]">
            {variant === 'sharedWithMe' && 'shared the following journey: '}
            {variant === 'accessRequest' &&
              'requested access to the following journey: '}
          </Text>
        </Column>
      </Row>
    </Section>
  )
}
