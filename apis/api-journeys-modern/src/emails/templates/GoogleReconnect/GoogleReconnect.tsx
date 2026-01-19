import {
  Body,
  Column,
  Head,
  Html,
  Preview,
  Row,
  Section
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
import { User } from '@core/yoga/firebaseClient'

import { env } from '../../../env'

interface GoogleReconnectEmailProps {
  teamName?: string
  accountEmail?: string
  recipient: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const GoogleReconnectEmail = ({
  teamName,
  accountEmail,
  recipient,
  story = false
}: GoogleReconnectEmailProps): ReactElement => {
  const previewText = `NextSteps: Action required - Reconnect your Google account for ${teamName}`
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
          <ActionCard
            headerText="Google Account Reconnection Required"
            subHeaderText={accountEmail != null ? `Account: ${accountEmail}` : undefined}
            bodyText={`Your Google Sheets sync for team "${teamName}" has stopped working because your Google account authorization has expired. Please reconnect your Google account to resume syncing.`}
            recipient={recipient}
          >
            <Section align="center">
              <Row className="px-[28px]">
                <Column align="center">
                  <ActionButton
                    url={`${env.JOURNEYS_ADMIN_URL}/teams`}
                    buttonText="Reconnect Google Account"
                  />
                </Column>
              </Row>
            </Section>
          </ActionCard>
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={recipient.email ?? ''} />
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

GoogleReconnectEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  accountEmail: 'example@gmail.com',
  recipient: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    email: 'jron@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies GoogleReconnectEmailProps

export default GoogleReconnectEmail
