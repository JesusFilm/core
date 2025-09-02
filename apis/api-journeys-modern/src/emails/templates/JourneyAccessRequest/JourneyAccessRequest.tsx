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
} from '@core/yoga/email/components'
import { JourneyForEmails } from '@core/yoga/email/types/types'
import { User } from '@core/yoga/firebaseClient'

import { Journey } from '../../../workers/email/service/prisma.types'

interface JourneyAccessRequestEmailProps {
  inviteLink: string
  recipient: Omit<User, 'id' | 'emailVerified'>
  sender: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
  journey: Journey
}

interface WrapperProps {
  children: ReactElement
}

export const JourneyAccessRequestEmail = ({
  inviteLink,
  recipient,
  sender,
  story = false,
  journey
}: JourneyAccessRequestEmailProps): ReactElement => {
  const previewText = `Do you want to share journey: ${journey.title}`
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
            recipientText={`Hi ${recipient?.firstName ?? ''}, do you want to`}
            recipient={recipient}
          >
            <Section align="center" className="px-[28px]">
              <Row>
                <th>
                  <Text
                    className="font-semibold text-[20px] leading-[28px] mt-[0px] mb-[20px] text-center"
                    style={{
                      font: '20px "Open Sans", sans-serif'
                    }}
                  >
                    share a journey?
                  </Text>
                </th>
              </Row>
              <ActionSender sender={sender} variant="accessRequest" />
            </Section>
            <ActionJourneyView
              journey={journey as unknown as JourneyForEmails}
              url={inviteLink}
              buttonText="Open Journey"
              variant="withTeam"
            />
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

JourneyAccessRequestEmail.PreviewProps = {
  journey: {
    title: 'Why Jesus?',
    team: {
      title: 'Ukrainian outreach team Odessa'
    },
    primaryImageBlock: {
      src: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?q=80&w=3105&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  } as unknown as Journey,
  inviteLink: 'https://admin.nextstep.is/journeys/journeyId',
  recipient: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    email: 'ronImo@example',
    imageUrl: undefined
  },
  sender: {
    firstName: 'Nee',
    email: 'neesail@example.com',
    lastName: 'Sail',
    imageUrl: undefined
  }
} satisfies JourneyAccessRequestEmailProps

export default JourneyAccessRequestEmail
