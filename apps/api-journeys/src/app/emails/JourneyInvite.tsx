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
import { ReactElement } from 'react'

interface JourneyInviteEmailProps {
  email?: string
  journeyTitle?: string
  inviteLink?: string
}

export const JourneyInviteEmail = ({
  email,
  journeyTitle,
  inviteLink
}: JourneyInviteEmailProps): ReactElement => {
  const previewText = `Invitation to edit journey: ${journeyTitle}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Invitation to edit journey: <strong>{journeyTitle}</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {email},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              {'You have been invited to edit the journey: '}
              <strong>{journeyTitle}</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#C52D3A] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Go to Journey
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
              <span className="text-black">{email}</span>. If you were not
              expecting this invitation, you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

JourneyInviteEmail.PreviewProps = {
  email: 'johnathon@example.com',
  journeyTitle: 'A Christmas Story',
  inviteLink: 'https://admin.nextstep.is/journeys/journeyId'
} satisfies JourneyInviteEmailProps

export default JourneyInviteEmail
