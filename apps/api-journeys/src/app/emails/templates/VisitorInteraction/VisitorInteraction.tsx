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
  BodyWrapper,
  EmailContainer,
  Header
} from '@core/nest/common/email/components'

interface VisitorInteractionProps {
  journeyId: string
  visitorId: string
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const VisitorInteraction = ({
  journeyId,
  visitorId,
  story = false
}: VisitorInteractionProps): ReactElement => {
  const previewText = `Visitor Interaction Email: ${visitorId}`
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
          <ActionCard>
            <Section align="center">
              <Row className="px-[28px]">
                <Text>
                  {visitorId} have interacted with your journey: {journeyId}
                </Text>
              </Row>
            </Section>
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
