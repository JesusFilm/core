import { Body, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import {
  BodyWrapper,
  EmailContainer,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/yoga/email/components'

import type { AppType } from '../../../schema/user/enums/app'

import {
  getFooterContent,
  getPreviewText,
  getVerificationContent
} from './utils'

interface VerifyEmailProps {
  inviteLink: string
  token: string
  story?: boolean
  app: NonNullable<AppType>
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
  story = false,
  app
}: VerifyEmailProps): ReactElement => {
  const VerificationContent = getVerificationContent(app)
  const FooterContent = getFooterContent(app)
  const previewText = getPreviewText(app)

  const showUnsubscribeLink = app !== 'JesusFilmApp'

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
      <Header logo={app} />
      <EmailContainer>
        <BodyWrapper>
          <VerificationContent
            inviteLink={inviteLink}
            recipient={recipient}
            token={token}
          />
        </BodyWrapper>
        <Footer>
          <FooterContent />
        </Footer>
        {showUnsubscribeLink && (
          <UnsubscribeLink recipientEmail={recipient.email} />
        )}
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

EmailVerifyEmail.PreviewProps = {
  token: '123456',
  recipient: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    email: 'joe@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  inviteLink: 'https://admin.nextstep.is/users/verify',
  app: 'NextSteps'
} satisfies VerifyEmailProps

export default EmailVerifyEmail
