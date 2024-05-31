import {
  Body,
  Column,
  Head,
  Html,
  Preview,
  Row,
  Section
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { Event } from '.prisma/api-journeys-client'
import {
  ActionButton,
  ActionCard,
  BodyWrapper,
  EmailContainer,
  Header
} from '@core/nest/common/email/components'
import { User } from '@core/nest/common/firebaseClient'

import { VisitorCard } from './VisitorCard'

interface Visitor {
  createdAt: Date
  duration: number
  events
}

interface VisitorInteractionProps {
  title: string
  url: string
  visitor: Visitor
  recipient: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const VisitorInteraction = ({
  title,
  url,
  recipient,
  visitor,
  story = false
}: VisitorInteractionProps): ReactElement => {
  const previewText = `Visitor Interaction Email`
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
            recipientText={`Hey ${recipient.firstName},`}
            bodyText={`Someone interacted with your ${title} and submitted the next data:`}
            recipient={recipient}
          >
            <Section align="center">
              <Row className="px-[28px]">
                <Column>
                  <ActionButton url={url} buttonText="Open Full User Report" />
                </Column>
              </Row>
            </Section>
            <VisitorCard
              createdAt={visitor.createdAt}
              duration={visitor.duration}
              events={visitor.events}
            />
          </ActionCard>
        </BodyWrapper>
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

VisitorInteraction.PreviewProps = {
  title: 'Journey Title',
  visitor: {
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
      },
      {
        id: 'eef796c6-cf25-4a20-b799-f237a543f942',
        typename: 'TextResponseSubmissionEvent',
        journeyId: 'bd62980f-3302-481d-8d66-a6ad2bdc936a',
        blockId: '67094b1c-4446-44ec-8aa3-e3213ae6db34',
        stepId: 'a9a10c4e-dfbc-4efd-ac98-7eea5ec615ad',
        createdAt: new Date('2024-05-27T23:39:28.000Z'),
        label: 'Why is tailwind like this, took forever',
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
      },
      {
        id: 'eef796c6-cf25-4a20-b799-f237a543f942',
        typename: 'TextResponseSubmissionEvent',
        journeyId: 'bd62980f-3302-481d-8d66-a6ad2bdc936a',
        blockId: '67094b1c-4446-44ec-8aa3-e3213ae6db34',
        stepId: 'a9a10c4e-dfbc-4efd-ac98-7eea5ec615ad',
        createdAt: new Date('2024-05-27T23:39:28.000Z'),
        label: 'This is another response with a long text',
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
  },
  recipient: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    email: 'jron@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  url: ''
} satisfies VisitorInteractionProps

export default VisitorInteraction
