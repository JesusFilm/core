import { Body, Container, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import { ActionCard } from '../../components/ActionCard'
import { BodyText } from '../../components/BodyText'
import { BodyTitle } from '../../components/BodyTitle'
import { BodyWrapper } from '../../components/BodyWrapper'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { UnsubscribeLink } from '../../components/UnsubscribeLink'

interface TeamInviteNoAccountProps {
  teamName: string
  inviteLink: string
  sender: Omit<User, 'id' | 'email'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamInviteNoAccountEmail = ({
  teamName,
  inviteLink,
  sender,
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
      <Container className="my-[40px] rounded border border-solid border-[#eaeaea]">
        <Header sender={sender} />
        <BodyWrapper>
          <ActionCard
            url={inviteLink}
            headerText={`${sender.firstName} invites you to the workspace: ${teamName}`}
            buttonText={`Join ${sender.firstName}`}
          />
          <BodyTitle bodyTitle="What is NextSteps?" />
          <BodyText bodyText="NextSteps is a New Platform For Creating Smart Gospel stories that adapt to your audience." />
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

TeamInviteNoAccountEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies TeamInviteNoAccountProps

export default TeamInviteNoAccountEmail
