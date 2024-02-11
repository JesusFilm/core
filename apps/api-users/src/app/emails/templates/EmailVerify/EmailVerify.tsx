import { Body, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import {
  ActionCard,
  BodyText,
  BodyWrapper,
  EmailContainer,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/nest/common/email/components'

interface VerifyEmailProps {
  inviteLink: string
  token: string
  story?: boolean
  sender: {
    firstName: string
    lastName: string
    imageUrl?: string
  }
}

interface WrapperProps {
  children: ReactElement
}

export const EmailVerifyEmail = ({
  inviteLink,
  sender,
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
    <EmailContainer>
      <Header sender={sender} />
      <BodyWrapper>
        <ActionCard
          url={inviteLink}
          headerText="Verify your email address to start making interactive Journeys!"
          buttonText="Verify Email Address"
        />
        <BodyText>Verification Token: {token}</BodyText>
        <UnsubscribeLink />
      </BodyWrapper>
      <Footer />
    </EmailContainer>
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
    <Html>
      <Head />
      {children}
    </Html>
  )
}

const withBody = ({ children }: WrapperProps): ReactElement => {
  return (
    <Body className="bg-[#DEDFE0] my-auto mx-auto font-sans px-2">
      {children}
    </Body>
  )
}

EmailVerifyEmail.PreviewProps = {
  token: '123456',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  inviteLink: 'https://admin.nextstep.is/users/verify'
} satisfies VerifyEmailProps

export default EmailVerifyEmail
