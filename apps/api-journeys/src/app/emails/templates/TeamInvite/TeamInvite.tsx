import { Body, Container, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import {
  ActionCard,
  BodyText,
  BodyTitle,
  BodyWrapper,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/nest/common/email/components'
import { User } from '@core/nest/common/firebaseClient'

interface TeamInviteEmailProps {
  email: string
  teamName: string
  inviteLink: string
  sender: Omit<User, 'id' | 'email' | 'emailVerified'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamInviteEmail = ({
  email,
  teamName,
  inviteLink,
  sender,
  story = false
}: TeamInviteEmailProps): ReactElement => {
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
      <Container className="my-[40px] rounded border border-solid border-[#eaeaea]">
        <Header sender={sender} />
        <BodyWrapper>
          <BodyTitle
            bodyTitle={`${sender.firstName} invites you to the workspace: ${teamName}`}
          />
          <ActionCard
            url={inviteLink}
            headerText={`Login to NextSteps to join ${sender.firstName}`}
            buttonText={`Join ${sender.firstName}`}
          />
          <BodyText>
            If you do not want to be on this team, ask ${sender.firstName} to
            remove you.
          </BodyText>
          <UnsubscribeLink />
        </BodyWrapper>
        <Footer />
      </Container>
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

TeamInviteEmail.PreviewProps = {
  email: 'james@example.com',
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies TeamInviteEmailProps

export default TeamInviteEmail
