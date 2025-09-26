import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { intlFormat, parseISO } from 'date-fns'
import { ReactElement, ReactNode } from 'react'

import { Event, Prisma } from '@core/prisma/journeys/client'
import {
  ActionCard,
  BodyWrapper,
  EmailContainer,
  Header,
  UnsubscribeLink
} from '@core/yoga/email/components'
import { User } from '@core/yoga/firebaseClient'

type Visitor = Prisma.VisitorGetPayload<{
  select: {
    id: true
    createdAt: true
    duration: true
    events: true
  }
}>

interface VisitorInteractionProps {
  title: string
  visitor: Visitor
  recipient: Omit<User, 'id' | 'emailVerified'>
  analyticsUrl: string
  unsubscribeUrl: string
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const VisitorInteraction = ({
  title,
  recipient,
  analyticsUrl,
  unsubscribeUrl,
  visitor,
  story = false
}: VisitorInteractionProps): ReactElement => {
  const previewText = `Someone interacted with your journey`
  const tailwindWrapper = ({ children }: WrapperProps): ReactElement => {
    return (
      <>
        <Preview>{previewText}</Preview>
        <Tailwind>{children}</Tailwind>
      </>
    )
  }

  function transformDuration(seconds?: number | null): string {
    if (seconds == null) {
      return '0 min'
    } else if (seconds <= 60) {
      return `${seconds} sec`
    } else {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} min`
    }
  }

  const created = intlFormat(parseISO(visitor.createdAt.toISOString()), {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })

  const eventsFilter = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent',
    'SignUpSubmissionEvent'
  ]

  const filteredEvents = visitor.events.filter((event) =>
    eventsFilter.includes(event.typename)
  )

  const emailBody: ReactNode = (
    <>
      <Header />
      <EmailContainer>
        <BodyWrapper>
          <ActionCard
            bodyText={`Someone interacted with your ${title} and submitted the next data:`}
            recipient={recipient}
            textAlignment="text-left"
          >
            <Section align="center">
              <Row className="px-[28px]">
                <Column>
                  <Button
                    className="rounded-sm bg-[#E43343] px-5 py-5 text-center text-[16px] font-semibold text-white no-underline"
                    style={{
                      font: '16px "Open Sans", sans-serif'
                    }}
                    href={analyticsUrl}
                  >
                    Open Full User Report
                  </Button>
                </Column>
              </Row>
            </Section>
            <Container className="mt-[20px] bg-[#FFFFFF]">
              <Section align="center">
                <Row className="px-[28px]">
                  <Column>
                    <Text
                      className="font-sans text-[16px] leading-[24px]"
                      style={{
                        font: '16px "Open Sans", sans-serif',
                        color: '#6D6D7D'
                      }}
                    >
                      {created} {'\u00A0\u00B7\u00A0'}{' '}
                      {transformDuration(visitor.duration)}
                    </Text>
                  </Column>
                </Row>
              </Section>
              {filteredEvents.map((event) => (
                <Section key={event?.id} align="center" className="px-[28px]">
                  <Column className="w-2/4">
                    <Text className="mb-[0px] font-sans text-[16px] leading-[24px]">
                      {event.typename === 'ChatOpenEvent'
                        ? 'Chat Started'
                        : event.label}
                    </Text>
                  </Column>
                  <Column className="w-2/4">
                    <Text className="mb-[0px] font-sans text-[16px] leading-[24px]">
                      {'\u00B7\u00A0\u00A0'} {event.value}
                    </Text>
                  </Column>
                </Section>
              ))}
            </Container>
          </ActionCard>
        </BodyWrapper>
        <UnsubscribeLink
          recipientEmail={recipient.email ?? ''}
          url={unsubscribeUrl}
        />
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
    <Body className="mx-[0px] my-[0px] h-full w-full font-sans">
      {children}
    </Body>
  )
}

const event: Event = {
  id: 'event 1',
  typename: 'event',
  journeyId: 'journeyId',
  blockId: 'blockId',
  stepId: 'stepId',
  createdAt: new Date('2024-05-27T23:39:28.000Z'),
  label: null,
  value: 'Test',
  visitorId: 'visitorId',
  action: null,
  actionValue: null,
  messagePlatform: null,
  languageId: null,
  radioOptionBlockId: null,
  email: null,
  nextStepId: null,
  previousStepId: null,
  position: null,
  source: null,
  progress: null,
  userId: null,
  journeyVisitorJourneyId: null,
  journeyVisitorVisitorId: null,
  updatedAt: new Date('2024-05-27T23:39:28.000Z')
}

VisitorInteraction.PreviewProps = {
  title: 'Journey Title',
  visitor: {
    id: 'userId',
    createdAt: new Date('2024-05-27T23:39:28.000Z'),
    duration: 10,
    events: [
      {
        ...event,
        typename: 'TextResponseSubmissionEvent',
        id: 'event 1',
        label: 'Text Response Submission Event',
        value: 'My mom is sick'
      },
      {
        ...event,
        typename: 'ChatOpenEvent',
        id: 'event 2',
        value: '12:00 PM'
      },
      {
        ...event,
        typename: 'RadioQuestionSubmissionEvent',
        id: 'event 3',
        label: 'Radio Question Submission Event',
        value: 'Health'
      },
      {
        ...event,
        typename: 'StepViewEvent',
        id: 'event 4',
        label: 'Step View Event'
      }
    ]
  },
  recipient: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    email: 'jron@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  analyticsUrl: 'localhost:4200/journeys/journeyId/reports/visitors',
  unsubscribeUrl: 'localhost:4200/journeys/journeyId?manageAccess'
} satisfies VisitorInteractionProps

export default VisitorInteraction
