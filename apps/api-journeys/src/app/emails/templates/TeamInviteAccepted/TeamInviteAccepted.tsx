import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import EmailLogo from '../EmailLogo/EmailLogo'

interface TeamInviteAcceptedEmailProps {
  teamName?: string
  inviteLink?: string
  sender: Omit<User, 'id' | 'email'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamInviteAcceptedEmail = ({
  teamName,
  inviteLink,
  sender,
  story = false
}: TeamInviteAcceptedEmailProps): ReactElement => {
  const previewText = `${sender.firstName} has been added to your team`
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
      <Container className="my-[40px] rounded border border-solid border-[#eaeaea]">
        <Container className="bg-[#FFFFFF] h-[72px] flex justify-center items-center">
          <Row className="flex justify-center items-center">
            <Column className="pr-[80px]">
              <EmailLogo />
            </Column>
            <Column>
              {sender.imageUrl != null && (
                <Img
                  src={sender.imageUrl ?? ''}
                  alt={sender.firstName}
                  width={32}
                  height={32}
                  className="rounded-full border-solid border-2 border-[#FFFFFF]"
                />
              )}
            </Column>
            <Column className="pl-[10px]">
              <Heading
                as="h2"
                className="text-black text-[16px] font-normal font-['Helvetica']"
              >{`${sender.firstName} ${sender.lastName}`}</Heading>
            </Column>
          </Row>
        </Container>
        <Container className="bg-[#EFEFEF] mx-auto px-[60px] py-[48px] max-w-[600px] flex justify-center items-center">
          <Heading className="text-black text-[24px] font-normal p-0 my-[30px] mx-0">
            {`${sender.firstName} was added to your team ${teamName}`}
          </Heading>
          <Text className="text-black text-[14px] leading-[24px]">
            {`If this is in error, please go to ${teamName} team manage dashboard to remove them`}
          </Text>
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-[#C52D3A] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={inviteLink}
            >
              View Team
            </Button>
          </Section>
          <Text className="text-black text-[14px] leading-[24px]">
            or copy and paste this URL into your browser:{' '}
            <Link href={inviteLink} className="text-blue-600 no-underline">
              {inviteLink}
            </Link>
          </Text>
        </Container>
        <Container className="bg-[#E3E3E3] h-[72px] p-[20px] px-[80px] flex justify-center items-center">
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

TeamInviteAcceptedEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    lastName: 'Ro-Nimo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
} satisfies TeamInviteAcceptedEmailProps

export default TeamInviteAcceptedEmail
