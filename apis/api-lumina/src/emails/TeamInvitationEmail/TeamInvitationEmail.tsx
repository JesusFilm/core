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
  Footer,
  Header,
  UnsubscribeLink
} from '@core/yoga/email/components'
import { Team, TeamInvitation } from '@core/prisma/lumina/client'

interface TeamInvitationEmailProps {
  invitation: TeamInvitation & { team: Team }
  token: string
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export function TeamInvitationEmail({
  invitation,
  token,
  story = false
}: TeamInvitationEmailProps): ReactElement {
  const previewText = `Join ${invitation.team.name} on Lumina`
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
            headerText={`You are invited to join the team: `}
            subHeaderText={`${invitation.team.name}`}
          >
            <Section align="center">
              <Row className="px-[28px]">
                <Column align="center">
                  <ActionButton
                    url={`${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`}
                    buttonText="Join Now"
                  />
                </Column>
              </Row>
            </Section>
          </ActionCard>
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={invitation.email} />
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
    <Body className="mx-[0px] my-[0px] h-full w-full font-sans">
      {children}
    </Body>
  )
}

TeamInvitationEmail.PreviewProps = {
  invitation: {
    team: {
      id: 'team_id',
      name: 'JFP Sol Team',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    id: 'invitation_id',
    teamId: 'team_id',
    email: 'test@example.com',
    role: 'MEMBER',
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenHash: 'token_hash'
  },
  token: 'token'
} satisfies TeamInvitationEmailProps

export default TeamInvitationEmail
