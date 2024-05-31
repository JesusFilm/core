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

interface VisitorCardProps {
  createdAt: Date
  duration: number
  events
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

  const emailBody: ReactNode = (
    <Container className="bg-[#FFFFFF] mt-[20px]">
      <Section align="center">
        <Row className="px-[28px]">
          <Column>
            <Text>
              {created} {'\u00A0\u00B7\u00A0'} {transformDuration(duration)}
            </Text>
          </Column>
        </Row>
      </Section>
      {events.map((event) => (
        <Section align="center" className="px-[28px]">
          <Row>
            <Column>
              <Text>{event.label}</Text>
            </Column>
            <Column>
              <Text>{'\u00B7\u00A0'}</Text>
            </Column>
            <Column>
              <Text>{event.value}</Text>
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

VisitorCard.PreviewProps = {
  createdAt: new Date(),
  duration: 10,
  events: [
    {
      id: 'eef796c6-cf25-4a20-b799-f237a543f942',
      typename: 'TextResponseSubmissionEvent',
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
  ]
} satisfies VisitorCardProps

export default VisitorCard
