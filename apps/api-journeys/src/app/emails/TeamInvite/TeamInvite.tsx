import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement } from 'react'

import EmailLogo from '../EmailLogo/EmailLogo'

interface TeamInviteEmailProps {
  email?: string
  teamName?: string
  inviteLink?: string
}

export const TeamInviteEmail = ({
  email,
  teamName,
  inviteLink
}: TeamInviteEmailProps): ReactElement => {
  const previewText = `Join ${teamName} on Next Steps`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="my-[40px] rounded border border-solid border-[#eaeaea]">
            <Container className="bg-[#FFFFFF] h-[72px] flex justify-center items-center">
              <EmailLogo />
            </Container>
            <Container className="bg-[#EFEFEF] mx-auto p-[20px] max-w-[600px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Join <strong>{teamName}</strong> on <strong>Next Steps</strong>
              </Heading>
              <Text className="text-black text-[14px] leading-[24px]">
                Hello {email},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                {'You have been invited to join: '}
                <strong>{teamName}</strong> on <strong>Next Steps</strong>.
              </Text>
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#C52D3A] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={inviteLink}
                >
                  Join the team
                </Button>
              </Section>
              <Text className="text-black text-[14px] leading-[24px]">
                or copy and paste this URL into your browser:{' '}
                <Link href={inviteLink} className="text-blue-600 no-underline">
                  {inviteLink}
                </Link>
              </Text>
            </Container>
            <Container className="bg-[#E3E3E3] h-[72px] p-[20px] flex justify-center items-center">
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                This invitation was intended for{' '}
                <span className="text-black">{email}</span>. If you were not
                expecting this invitation, you can ignore this email.
              </Text>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

TeamInviteEmail.PreviewProps = {
  email: 'james@example.com',
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/'
} satisfies TeamInviteEmailProps

export default TeamInviteEmail
