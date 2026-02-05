import {
  Body,
  Column,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import {
  ActionButton,
  ActionCard,
  BodyWrapper,
  EmailContainer,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/yoga/email/components'

interface VerifyEmailProps {
  inviteLink: string
  token: string
  story?: boolean
  recipient: {
    firstName: string
    lastName: string
    email: string
    imageUrl?: string
  }
}

interface WrapperProps {
  children: ReactElement
}

export const EmailVerifyJesusFilmOne = ({
  inviteLink,
  recipient,
  token,
  story = false
}: VerifyEmailProps): ReactElement => {
  const previewText = `Verify your email address with the Jesus Film Project`
  const tailwindWrapper = ({ children }: WrapperProps): ReactElement => {
    return (
      <>
        <Preview>{previewText}</Preview>
        <Tailwind>{children}</Tailwind>
      </>
    )
  }
  const emailBody: ReactNode = (
    <>
      <Header logo="JesusFilmOne" />
      <EmailContainer>
        <BodyWrapper>
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
                  <ActionButton
                    buttonText="Verify Email Address"
                    url={inviteLink}
                  />
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
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={recipient.email} />
      </EmailContainer>
    </>
  )
  return (
    <>
      {story
        ? tailwindWrapper({ children: emailBody })
        : withHTML({
            children: tailwindWrapper({
              children: withBody({ children: emailBody })
            })
          })}
    </>
  )
}

const withHTML = ({ children }: WrapperProps): ReactElement => {
  return (
    <Html
      style={{
        height: '100%',
        width: '100%'
      }}
    >
      <Head />
      {children}
    </Html>
  )
}

const withBody = ({ children }: WrapperProps): ReactElement => {
  return (
    <Body className="mx-[0px] my-[0px] h-full w-full font-sans">
      {children}
    </Body>
  )
}

EmailVerifyJesusFilmOne.PreviewProps = {
  token: '123456',
  recipient: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    email: 'joe@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  inviteLink: 'https://admin.nextstep.is/users/verify'
} satisfies VerifyEmailProps

export default EmailVerifyJesusFilmOne
