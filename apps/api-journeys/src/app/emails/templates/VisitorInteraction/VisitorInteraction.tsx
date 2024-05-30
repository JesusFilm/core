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

import {
  ActionButton,
  ActionCard,
  BodyWrapper,
  EmailContainer,
  Header
} from '@core/nest/common/email/components'
import { User } from '@core/nest/common/firebaseClient'

import { VisitorCard } from './VisitorCard'

interface VisitorInteractionProps {
  title: string
  url: string
  visitor: string
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
            <VisitorCard />
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
  visitor: '',
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
