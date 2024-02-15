import { Body, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import {
  ActionCard,
  BodyWrapper,
  EmailContainer,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/nest/common/email/components'
import { User } from '@core/nest/common/firebaseClient'

interface TeamInviteEmailProps {
  teamName: string
  inviteLink: string
  recipient: Omit<User, 'id' | 'emailVerified'>
  sender: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
}

interface WrapperProps {
  children: ReactElement
}

export const TeamInviteEmail = ({
  teamName,
  recipient,
  inviteLink,
  sender,
  story = false
}: TeamInviteEmailProps): ReactElement => {
  const previewText = `Join ${teamName} on Next Steps`
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
            url={inviteLink}
            headerText={`${sender.firstName} invites you to the workspace: `}
            subHeaderText={`${teamName}`}
            buttonText="Join Now"
            sender={sender}
            recipient={recipient}
          />
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={recipient.email} />
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

TeamInviteEmail.PreviewProps = {
  teamName: 'JFP Sol Team',
  inviteLink: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    email: 'joejoesbizzareadventures@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  recipient: {
    firstName: 'Nee',
    email: 'neesail@example.com',
    lastName: 'Sail',
    imageUrl:
      'https://s3-alpha-sig.figma.com/img/772d/9819/02ebd5f068f6a3d437b4fc9f012a7102?Expires=1708905600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C6QXa0ycSXjPnW8H~f5fo49JwKf~aW~GMm8CSifCuWcCLDs-ft-h8Db9DNzIfaxlnYPNNJ2OzEzxcmYinmB~RL5CGYJQZUGKvu1YwoximgzXP~0vDbxYJ2Hrm~M9uQhIth2yHFZmDeBt1j6YtBmxpuAb89e1GYbOeOXqFF8gZqD74rL0nhwdw5vX3-J7LLd31bUOJhQ8CEdcZHNjQlqb3Twv3pxShAS0OIBlpwON8TLwKASKedYvz-3qwxNsr97AbyOocNFrmCXtVZv8Eqe6-qMatDnLrXRNBklQcLjK36tDzNx1SBv8-iBj~BasAva2FwQmu9aegkjlTP43eMbRLw__'
  }
} satisfies TeamInviteEmailProps

export default TeamInviteEmail
