import { Column, Row, Section, Text } from '@react-email/components'
import { ReactElement } from 'react'

import { ActionButton, ActionCard } from '@core/yoga/email/components'

import type { VerificationContentProps } from '../../NextStepsVerificationContent/Body'

export const JesusFilmAppVerificationContent = ({
  recipient,
  token,
  inviteLink
}: VerificationContentProps): ReactElement => {
  return (
    <ActionCard recipient={recipient}>
      <Section align="center" className="px-[28px]">
        <Row>
          <th>
            <Text className="mt-0 mb-[24px] text-center text-[16px] leading-[28px] font-semibold">
              Verify your email address to complete your account setup.
            </Text>
          </th>
        </Row>
        <Row className="px-[28px]">
          <Column align="center">
            <ActionButton buttonText="Verify Email Address" url={inviteLink} />
          </Column>
        </Row>
        <Row>
          <Text className="mt-[24px] mb-[8px] text-center text-[14px] leading-[24px] font-[400]">
            Your verification code is{' '}
            <strong className="text-[#C52D3A]">{token}</strong>
          </Text>
        </Row>
      </Section>
    </ActionCard>
  )
}
