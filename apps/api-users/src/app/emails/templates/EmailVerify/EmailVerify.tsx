import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

interface VerifyEmailProps {
  email: string
  inviteLink: string
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const EmailVerifyEmail = ({
  email,
  inviteLink,
  story = false
}: VerifyEmailProps): ReactElement => {
  const previewText = `Verify your email address on Next Steps`
  const tailwindWrapper = ({ children }: WrapperProps): ReactElement => {
    return (
      <>
        <Preview>{previewText}</Preview>
        <Tailwind>{children}</Tailwind>
      </>
    )
  }
  const emailBody: ReactNode = (
    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Verify your email on <strong>Next Steps</strong>
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        Hello {email},
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        {'Please verify your email '}
        on <strong>Next Steps</strong>.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[#C52D3A] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={inviteLink}
        >
          Verify your email address
        </Button>
      </Section>
      <Text className="text-black text-[14px] leading-[24px]">
        or copy and paste this URL into your browser:{' '}
        <Link href={inviteLink} className="text-blue-600 no-underline">
          {inviteLink}
        </Link>
      </Text>
      <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
      <Text className="text-[#666666] text-[12px] leading-[24px]">
        This invitation was intended for{' '}
        <span className="text-black">{email}</span>. If you were not expecting
        this verifcation email, you can ignore this email.
      </Text>
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

EmailVerifyEmail.PreviewProps = {
  email: 'james@example.com',
  inviteLink: 'https://admin.nextstep.is/'
} satisfies VerifyEmailProps

export default EmailVerifyEmail
