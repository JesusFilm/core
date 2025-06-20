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

interface TeamRemovedEmailProps {
  teamName?: string
  recipient: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamRemovedEmail = ({
  teamName,
  recipient,
  story = false
}: TeamRemovedEmailProps): ReactElement => {
  const previewText = `You have been removed from: ${teamName}`
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
            headerText="You were removed from:"
            subHeaderText={`${teamName}`}
            bodyText="If this is in error, please contact the team manager to be invited back."
            recipient={recipient}
          >
            <Section align="center">
              <Row className="px-[28px]">
                <Column align="center">
                  <ActionButton
                    url={`${process.env.JOURNEYS_ADMIN_URL}`}
                    buttonText="View Your Teams"
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
    <Body className="my-[0px] mx-[0px] font-sans h-full w-full">
      {children}
    </Body>
  )
}

TeamRemovedEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  recipient: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    email: 'jron@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies TeamRemovedEmailProps

export default TeamRemovedEmail
