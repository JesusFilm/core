import { Column, Link, Row, Section, Text } from '@react-email/components'
import { ReactElement } from 'react'

import { ActionButton, ActionCard } from '@core/yoga/email/components'

export interface VerificationContentProps {
  inviteLink: string
  token: string
  recipient: {
    firstName: string
    lastName: string
    email: string
    imageUrl?: string
  }
}

export const NextStepsVerificationContent = ({
  inviteLink,
  recipient,
  token
}: VerificationContentProps): ReactElement => {
  return (
    <ActionCard recipient={recipient}>
      <Section align="center" className="px-[28px]">
        <Row>
          <th>
            <Text className="mt-0 mb-[24px] text-center text-[16px] leading-[28px] font-semibold">
              Verify your email address to start making interactive Journeys!
            </Text>
          </th>
        </Row>
        <Row className="px-[28px]">
          <Column align="center">
            <ActionButton buttonText="Verify Email Address" url={inviteLink} />
          </Column>
        </Row>
        <Row>
          <Text className="mt-[24px] mb-[0px] text-center text-[14px] leading-[24px] font-[400]">
            If the link above does not work, enter the following code at the
            link below:
          </Text>
          <Text className="my-0 text-center text-[14px] leading-[24px] font-[400]">
            {token}
          </Text>
          <Link href={inviteLink} style={{ textDecoration: 'none' }}>
            <Text className="mt-[24px] text-center text-[12px] leading-[16px] font-[400] text-[#C52D3A]">
              {inviteLink}
            </Text>
          </Link>
        </Row>
      </Section>
    </ActionCard>
  )
}
