import { Body, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import { ActionCard } from '../components/ActionCard'
import { BodyTitle } from '../components/BodyTitle'
import { BodyWrapper } from '../components/BodyWrapper'
import { EmailContainer } from '../components/EmailContainer'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { UnsubscribeLink } from '../components/UnsubscribeLink'

interface JourneySharedEmailProps {
  journeyTitle: string
  inviteLink: string
  sender: Omit<User, 'id' | 'email'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const JourneySharedEmail = ({
  journeyTitle,
  inviteLink,
  sender,
  story = false
}: JourneySharedEmailProps): ReactElement => {
  const previewText = `${journeyTitle} has been shared with you on NextSteps`
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
        <BodyTitle
          bodyTitle={`${journeyTitle} has been shared with you by ${sender.firstName}. You can see it under 'Shared With Me' in the team dropdown.`}
        />
        <ActionCard
          url={inviteLink}
          headerText={`🟠 ${journeyTitle}`}
          buttonText="View Journey"
        />
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

JourneySharedEmail.PreviewProps = {
  journeyTitle: 'Why Jesus?',
  inviteLink: 'https://admin.nextstep.is/journeys/journeyId',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies JourneySharedEmailProps

export default JourneySharedEmail
