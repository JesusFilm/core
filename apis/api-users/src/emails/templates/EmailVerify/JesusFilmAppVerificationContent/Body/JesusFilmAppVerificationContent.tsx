import { Row, Section, Text } from '@react-email/components'
import { ReactElement } from 'react'

import { ActionCard } from '@core/yoga/email/components'

import type { VerificationContentProps } from '../../NextStepsVerificationContent/Body'

export const JesusFilmAppVerificationContent = ({
  recipient,
  token
}: Omit<VerificationContentProps, 'inviteLink'>): ReactElement => {
  return (
    <ActionCard recipient={recipient}>
      <Section align="center" className="px-[28px]">
        <Row>
          <th>
            <Text className="mt-0 mb-[24px] text-center text-[16px] leading-[28px] font-semibold">
              Verify your email address to complete your account setup!
            </Text>
          </th>
        </Row>
        <Row>
          <Text className="mt-[24px] mb-[0px] text-center text-[14px] leading-[24px] font-[400]">
            Enter the following code in the app:
          </Text>
          <Text className="my-0 text-center text-[14px] leading-[24px] font-[400]">
            {token}
          </Text>
        </Row>
      </Section>
    </ActionCard>
  )
}
