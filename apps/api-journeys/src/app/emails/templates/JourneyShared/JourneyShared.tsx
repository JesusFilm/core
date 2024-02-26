import {
  Body,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import {
  ActionCard,
  ActionJourneyView,
  ActionSender,
  BodyWrapper,
  EmailContainer,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/nest/common/email/components'
import { JourneyForEmails } from '@core/nest/common/email/types/types'
import { User } from '@core/nest/common/firebaseClient'

import { JourneyWithTeamAndUserJourney } from '../../../modules/email/email.consumer'

interface JourneySharedEmailProps {
  journey: JourneyWithTeamAndUserJourney
  inviteLink: string
  sender: Omit<User, 'id' | 'emailVerified'>
  recipient: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const JourneySharedEmail = ({
  journey,
  recipient,
  inviteLink,
  sender,
  story = false
}: JourneySharedEmailProps): ReactElement => {
  const previewText = `${journey.title} has been shared with you on NextSteps`
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
          <ActionCard recipient={recipient}>
            <Section align="center" className="px-[28px]">
              <Row>
                <th>
                  <Text
                    className="font-semibold text-[20px] leading-[28px] mt-[0px] mb-[20px] text-center"
                    style={{
                      font: '20px "Open Sans", sans-serif'
                    }}
                  >
                    journey shared with you!
                  </Text>
                </th>
              </Row>
              <ActionSender sender={sender} variant="sharedWithMe" />
            </Section>
            <ActionJourneyView
              journey={journey as unknown as JourneyForEmails}
              url={inviteLink}
              buttonText="Manage Access"
            />
          </ActionCard>
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={recipient.email} />
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

JourneySharedEmail.PreviewProps = {
  journey: {
    title: 'Why Jesus?',
    team: {
      title: 'Ukrainian outreach team Odessa'
    },
    primaryImageBlock: {
      src: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?q=80&w=3105&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  } as unknown as JourneyWithTeamAndUserJourney,
  inviteLink: 'https://admin.nextstep.is/journeys/journeyId',
  recipient: {
    firstName: 'Cee',
    lastName: 'Y-Ang',
    email: 'cee-yee@example',
    imageUrl: undefined
  },
  sender: {
    firstName: 'Joe',
    email: 'joe@example.com',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies JourneySharedEmailProps

export default JourneySharedEmail
