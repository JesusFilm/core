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
import { ReactElement, ReactNode } from 'react'

// only needs
// visitors name
// visitor events
interface VisitorCardProps {
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const VisitorCard = ({
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

  const emailBody: ReactNode = (
    <Container className="bg-[#FFFFFF] mt-[20px]">
      <Section align="center">
        <Row className="px-[28px]">
          <Column>
            <Text>This is going to be the date</Text>
          </Column>
        </Row>
      </Section>
      <Section align="center" className="px-[28px]">
        <Row>
          <Column>
            <Text>This is going to be the date</Text>
          </Column>
          <Column>
            <Text>{'\u00B7\u00A0'}</Text>
          </Column>
          <Column>
            <Text>The Event</Text>
          </Column>
        </Row>
      </Section>
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

VisitorCard.PreviewProps = {} satisfies VisitorCardProps

export default VisitorCard
