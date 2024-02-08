import { Body, Container, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import { ActionCard } from '../components/ActionCard'
import { BodyText } from '../components/BodyText'
import { BodyTitle } from '../components/BodyTitle'
import { BodyWrapper } from '../components/BodyWrapper'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { UnsubscribeLink } from '../components/UnsubscribeLink'

interface TeamInviteAcceptedEmailProps {
  teamName: string
  inviteLink: string
  sender: Omit<User, 'id' | 'email'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamInviteAcceptedEmail = ({
  teamName,
  inviteLink,
  sender,
  story = false
}: TeamInviteAcceptedEmailProps): ReactElement => {
  const previewText = `${sender.firstName} has been added to your team`
  const tailwindWrapper = ({ children }: WrapperProps): ReactElement => {
    return (
      <>
        <Preview>{previewText}</Preview>
        <Tailwind>{children}</Tailwind>
      </>
    )
  }

  const emailBody: ReactNode = (
    <Container className="my-[40px] rounded border border-solid border-[#eaeaea]">
      <Header sender={sender} />
      <BodyWrapper>
        <BodyTitle
          bodyTitle={`${sender.firstName} was added to your team ${teamName}`}
        />
        <BodyText
          bodyText={`If this is in error, please go to ${teamName} team manage dashboard to remove them`}
        />
        <ActionCard
          url={inviteLink}
          headerText={teamName}
          buttonText=" View Team"
        />
        <UnsubscribeLink />
      </BodyWrapper>
      <Footer />
    </Container>
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

TeamInviteAcceptedEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies TeamInviteAcceptedEmailProps

export default TeamInviteAcceptedEmail
