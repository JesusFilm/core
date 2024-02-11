import { Body, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import { BodyText } from '../components/BodyText'
import { BodyTitle } from '../components/BodyTitle'
import { BodyWrapper } from '../components/BodyWrapper'
import { EmailContainer } from '../components/EmailContainer'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { UnsubscribeLink } from '../components/UnsubscribeLink'

interface TeamRemovedEmailProps {
  teamName?: string
  sender: Omit<User, 'id' | 'email'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamRemovedEmail = ({
  teamName,
  sender,
  story = false
}: TeamRemovedEmailProps): ReactElement => {
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
    <EmailContainer>
      <Header sender={sender} />
      <BodyWrapper>
        <BodyTitle
          bodyTitle={`You were removed from ${teamName} by ${sender.firstName}.`}
        />
        <BodyText
          bodyText={`If this is in error, please contact a Team Manager in ${teamName}`}
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

TeamRemovedEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  sender: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies TeamRemovedEmailProps

export default TeamRemovedEmail
