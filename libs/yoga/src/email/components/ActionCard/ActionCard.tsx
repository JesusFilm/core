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
    <Section className="mt-[60px] mb-[15px] max-w-[500px]">
      <Container
        align="center"
        className="w-full rounded-lg bg-[#FFFFFF] pt-[20px] pb-[40px]"
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
                  className="rounded-full border-4 border-solid border-[#FFFFFF] shadow-md"
                />
              ) : (
                <div className="h-[64px] w-[64px] rounded-full border-4 border-solid border-[#FFFFFF] bg-[#FFFFFF] shadow-md">
                  <Text className="mt-[14px] mr-[2px] font-sans text-3xl font-bold text-[#FFFFFF]">
                    👋
                  </Text>
                </div>
              )}
            </Column>
          </Row>
          <Row>
            <th>
              <Text
                className={`mt-[12px] mb-[0px] text-[16px] leading-[28px] font-semibold ${textPosition}`}
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
                  className={`mt-[0px] mb-[20px] text-center text-[16px] leading-[24px] font-semibold ${textPosition}`}
                  style={{
                    font: '16px "Open Sans", sans-serif'
                  }}
                >
                  {headerText}
                </Text>
              )}
              {subHeaderText != null && (
                <Text
                  className={`mt-[0px] mb-[20px] text-center text-[20px] leading-[24px] font-semibold ${textPosition}`}
                >
                  {subHeaderText}
                </Text>
              )}
              {bodyText != null && (
                <Text
                  className={`mt-[0px] mb-[20px] text-center text-[16px] leading-[24px] font-[400] ${textPosition}`}
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
