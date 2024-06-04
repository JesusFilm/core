import {
  Body,
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

import { Event } from '.prisma/api-journeys-client'

interface VisitorCardProps {
  createdAt: Date
  duration: number
  events: Event[]
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const VisitorCard = ({
  createdAt,
  duration,
  events,
  story = false
}: VisitorCardProps): ReactElement => {
  const previewText = `Join on Next Steps`
  const tailwindWrapper = ({ children }: WrapperProps): ReactElement => {
    return (
      <>
        <Preview>{previewText}</Preview>
        <Tailwind>{children}</Tailwind>
      </>
    )
  }

  const created = intlFormat(parseISO(createdAt.toISOString()), {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })

  const eventsFilter = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent'
  ]

  const filteredEvents = events.filter((event) =>
    eventsFilter.includes(event.typename)
  )

  const emailBody: ReactNode = (
    <Container className="bg-[#FFFFFF] mt-[20px]">
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
              {created} {'\u00A0\u00B7\u00A0'} {transformDuration(duration)}
            </Text>
          </Column>
        </Row>
      </Section>
      {filteredEvents.map((event) => (
        <Section align="center" className="px-[28px]">
          <Row>
            <Column style={{ width: '60%' }}>
              <Text
                className="font-sans text-[16px] leading-[24px] mb-[0px]"
                style={{
                  font: '16px "Open Sans", sans-serif',
                  color:
                    event.typename === 'ChatOpenEvent' ? '#E43343' : '#6D6D7D'
                }}
              >
                {event.label}
              </Text>
            </Column>
            <Column style={{ width: '40%' }} align="center">
              <Text
                className="font-sans text-[16px] leading-[24px]  mb-[0px]"
                style={{
                  font: '16px "Open Sans", sans-serif',
                  color:
                    event.typename === 'ChatOpenEvent' ? '#E43343' : '#6D6D7D'
                }}
              >
                {'\u00B7\u00A0\u00A0'} {event.value}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}
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

const event = {
  id: 'event 1',
  typename: 'event',
  journeyId: 'bd62980f-3302-481d-8d66-a6ad2bdc936a',
  blockId: '67094b1c-4446-44ec-8aa3-e3213ae6db34',
  stepId: 'a9a10c4e-dfbc-4efd-ac98-7eea5ec615ad',
  createdAt: new Date('2024-05-27T23:39:28.000Z'),
  label: 'Step 1',
  value: 'Test',
  visitorId: 'dcb4aa5f-5672-4350-af5a-c08946a3560a',
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

VisitorCard.PreviewProps = {
  createdAt: new Date(),
  duration: 10,
  events: [
    {
      ...event,
      typename: 'TextResponseSubmissionEvent',
      id: 'event 1',
      label: 'Text Response Submission Event',
      value: 'My mom is sick and I need help.'
    },
    {
      ...event,
      typename: 'ChatOpenEvent',
      id: 'event 2',
      label: 'Chat Open Event',
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
      typename: 'ChatOpenEvent',
      id: 'event 4',
      label:
        'I would like to know more about Jesus and what it means to follow Him. Can you help me?',
      value: '12:00 PM'
    }
  ]
} satisfies VisitorCardProps

export default VisitorCard
