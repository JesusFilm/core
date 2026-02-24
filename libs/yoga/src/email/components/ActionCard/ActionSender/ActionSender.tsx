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
              className="rounded-full border-[#FFFFFF] shadow-md"
            />
          ) : (
            <div className="h-[60px] w-[60px] rounded-full border-2 border-solid border-[#FFFFFF] bg-zinc-400 shadow-md">
              <Text className="mt-[12px] mr-[1px] text-center font-sans text-3xl font-bold text-[#FFFFFF]">
                {sender.firstName.at(0)}
              </Text>
            </div>
          )}
        </Column>
        <Column align="left" className="pl-[10px]">
          {sender.firstName != null && (
            <Text className="m-[0px] font-sans text-[16px] leading-[24px] font-semibold">
              {`${sender.firstName}`}
            </Text>
          )}
          {sender.email != null && (
            <Text className="m-[0px] font-sans text-[14px] leading-[24px] font-normal">
              {`${sender.email}`}
            </Text>
          )}
          <Text className="m-[0px] font-sans text-[16px] leading-[24px] font-semibold">
            {variant === 'sharedWithMe' && 'shared the following journey: '}
            {variant === 'accessRequest' &&
              'requested access to the following journey: '}
          </Text>
        </Column>
      </Row>
    </Section>
  )
}
