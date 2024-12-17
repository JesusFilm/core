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

interface TeamInviteNoAccountProps {
  teamName: string
  inviteLink: string
  sender: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
  recipientEmail: string
}

interface WrapperProps {
  children: ReactElement
}

export const TeamInviteNoAccountEmail = ({
  teamName,
  inviteLink,
  sender,
  recipientEmail,
  story = false
}: TeamInviteNoAccountProps): ReactElement => {
  const previewText = `Join ${teamName} on Next Steps`
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
            headerText={`${sender.firstName} invites you to the workspace: `}
            subHeaderText={`${teamName}`}
          >
            <Section align="center">
              <Row className="px-[28px]">
                <Column align="center">
                  <ActionButton url={inviteLink} buttonText="Join Now" />
                </Column>
              </Row>
            </Section>
          </ActionCard>
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={recipientEmail} />
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

TeamInviteNoAccountEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    email: 'joeRon@example.com',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  recipientEmail: 'someEmail@example.com'
} satisfies TeamInviteNoAccountProps

export default TeamInviteNoAccountEmail
