import {
  Body,
  Column,
  Head,
  Html,
  Link,
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

export const EmailVerifyEmail = ({
  inviteLink,
  recipient,
  token,
  story = false
}: VerifyEmailProps): ReactElement => {
  const previewText = `Verify your email address on Next Steps`
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
      <Header />
      <EmailContainer>
        <BodyWrapper>
          <ActionCard recipient={recipient}>
            <Section align="center" className="px-[28px]">
              <Row>
                <th>
                  <Text className="font-semibold text-[16px] leading-[28px] mt-0 mb-[24px] text-center">
                    Verify your email address to start making interactive
                    Journeys!
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
                <Text className="text-[14px] font-[400] leading-[24px] mt-[24px] mb-[0px] text-center">
                  If the link above does not work, enter the following code at
                  the link below:
                </Text>
                <Text className="text-[14px] font-[400] leading-[24px] my-0 text-center">
                  {token}
                </Text>
                <Link href={inviteLink} style={{ textDecoration: 'none' }}>
                  <Text className="text-center mt-[24px] text-[#C52D3A] font-[400] text-[12px] leading-[16px]">
                    {inviteLink}
                  </Text>
                </Link>
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
    <Body className="my-[0px] mx-[0px] font-sans h-full w-full">
      {children}
    </Body>
  )
}

EmailVerifyEmail.PreviewProps = {
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

export default EmailVerifyEmail
