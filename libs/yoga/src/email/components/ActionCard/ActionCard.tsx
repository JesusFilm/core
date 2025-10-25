import {
  Column,
  Container,
  Img,
  Row,
  Section,
  Text
} from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

import { User } from '../../../firebaseClient'

interface ActionCardProps {
  recipientText?: string
  headerText?: string
  subHeaderText?: string
  bodyText?: string
  recipient?: Omit<User, 'id' | 'emailVerified'>
  children?: ReactNode
  textAlignment?: string
}

export function ActionCard({
  recipientText,
  headerText,
  subHeaderText,
  bodyText,
  recipient,
  children,
  textAlignment
}: ActionCardProps): ReactElement {
  const textPosition = textAlignment != null ? textAlignment : 'text-center'

  return (
    <Section className="mt-[60px] mb-[15px] max-w-[500px] ">
      <Container
        align="center"
        className="w-full bg-[#FFFFFF] pt-[20px] pb-[40px] rounded-lg"
      >
        <Section align="center" className="px-[28px]">
          <Row align="center" style={{ marginTop: '-50px' }}>
            <Column align="center">
              {recipient?.imageUrl != null ? (
                <Img
                  src={recipient.imageUrl ?? ''}
                  alt={recipient?.firstName ?? ''}
                  width={64}
                  height={64}
                  className="rounded-full border-solid border-4 border-[#FFFFFF] shadow-md"
                />
              ) : (
                <div className="bg-[#FFFFFF] h-[64px] w-[64px] rounded-full border-solid border-4 border-[#FFFFFF] shadow-md">
                  <Text className="font-sans font-bold text-[#FFFFFF] text-3xl mt-[14px] mr-[2px]">
                    👋
                  </Text>
                </div>
              )}
            </Column>
          </Row>
          <Row>
            <th>
              <Text
                className={`font-semibold text-[16px] leading-[28px] mt-[12px] mb-[0px] ${textPosition}`}
                style={{
                  font: '16px "Open Sans", sans-serif'
                }}
              >
                {recipientText == null
                  ? `Hi ${recipient?.firstName || 'there'},`
                  : recipientText}
              </Text>
              {headerText != null && (
                <Text
                  className={`font-semibold text-[16px] leading-[24px] mt-[0px] mb-[20px] text-center ${textPosition}`}
                  style={{
                    font: '16px "Open Sans", sans-serif'
                  }}
                >
                  {headerText}
                </Text>
              )}
              {subHeaderText != null && (
                <Text
                  className={`font-semibold text-[20px] leading-[24px] mt-[0px] mb-[20px] text-center ${textPosition}`}
                >
                  {subHeaderText}
                </Text>
              )}
              {bodyText != null && (
                <Text
                  className={`font-[400] text-[16px] leading-[24px] mt-[0px] mb-[20px] text-center ${textPosition}`}
                >
                  {bodyText}
                </Text>
              )}
            </th>
          </Row>
        </Section>
        {children}
      </Container>
    </Section>
  )
}

ActionCard.PreviewProps = {
  headerText: 'To join them create an account with Next Steps'
} satisfies ActionCardProps

export default ActionCard
