import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import { ActionCard } from '../components/ActionCard'
import { BodyText } from '../components/BodyText'
import { BodyTitle } from '../components/BodyTitle'
import { BodyWrapper } from '../components/BodyWrapper'
import { Header } from '../components/Header'
import { UnsubscribeLink } from '../components/UnsubscribeLink'

interface JourneyAccessRequestEmailProps {
  journeyTitle: string
  inviteLink: string
  sender: Omit<User, 'id' | 'email'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const JourneyAccessRequestEmail = ({
  journeyTitle,
  inviteLink,
  sender,
  story = false
}: JourneyAccessRequestEmailProps): ReactElement => {
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
    <>
      <Container className="my-[40px] rounded border border-solid border-[#eaeaea] shadow-md">
        <Header sender={sender} />
        <BodyWrapper>
          <BodyTitle
            bodyTitle={`${sender.firstName} requested access to ${journeyTitle}! Login to NextSteps to give them access`}
          />
          <ActionCard
            url={inviteLink}
            headerText={`🟠 ${journeyTitle}`}
            buttonText="Grant Access"
          />
          <BodyText
            bodyText={`If you do not know ${sender.firstName} or don’t want to give them access, no further action is required`}
          />
          <UnsubscribeLink />
        </BodyWrapper>
        <Container className="bg-[#E3E3E3] h-[72px] p-[20px] px-[80px]">
          <Text className="text-[#666666] text-[12px] leading-[24px]">
            {`This is an automated email. If you need assistance, please `}
            <Link>contact support here instead of replying to this email</Link>.
          </Text>
        </Container>
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

JourneyAccessRequestEmail.PreviewProps = {
  journeyTitle: 'Why Jesus?',
  inviteLink: 'https://admin.nextstep.is/journeys/journeyId',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies JourneyAccessRequestEmailProps

export default JourneyAccessRequestEmail
