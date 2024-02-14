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

import { Journey } from '../../../modules/userInvite/userInvite.service'

interface JourneyAccessRequestEmailProps {
  inviteLink: string
  recipient: Omit<User, 'id' | 'emailVerified'>
  sender: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
  journey: Journey
}

interface WrapperProps {
  children: ReactElement
}

export const JourneyAccessRequestEmail = ({
  inviteLink,
  recipient,
  sender,
  story = false,
  journey
}: JourneyAccessRequestEmailProps): ReactElement => {
  const previewText = `Do you want to share journey: ${journey.title}`
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
            headerText="share a journey?"
            buttonText="Manage Access"
            variant="accessRequest"
            sender={sender}
            recipient={recipient}
            journey={journey}
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

JourneyAccessRequestEmail.PreviewProps = {
  journey: {
    title: 'Why Jesus?',
    team: {
      title: 'Ukrainian outreach team Odessa'
    },
    primaryImageBlock: {
      src: 'https://s3-alpha-sig.figma.com/img/772d/9819/02ebd5f068f6a3d437b4fc9f012a7102?Expires=1708905600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C6QXa0ycSXjPnW8H~f5fo49JwKf~aW~GMm8CSifCuWcCLDs-ft-h8Db9DNzIfaxlnYPNNJ2OzEzxcmYinmB~RL5CGYJQZUGKvu1YwoximgzXP~0vDbxYJ2Hrm~M9uQhIth2yHFZmDeBt1j6YtBmxpuAb89e1GYbOeOXqFF8gZqD74rL0nhwdw5vX3-J7LLd31bUOJhQ8CEdcZHNjQlqb3Twv3pxShAS0OIBlpwON8TLwKASKedYvz-3qwxNsr97AbyOocNFrmCXtVZv8Eqe6-qMatDnLrXRNBklQcLjK36tDzNx1SBv8-iBj~BasAva2FwQmu9aegkjlTP43eMbRLw__'
    }
  } as unknown as Journey,
  inviteLink: 'https://admin.nextstep.is/journeys/journeyId',
  recipient: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    email: 'ronImo@example',
    imageUrl: undefined
  },
  sender: {
    firstName: 'Nee',
    email: 'neesail@example.com',
    lastName: 'Sail',
    imageUrl: undefined
  }
} satisfies JourneyAccessRequestEmailProps

export default JourneyAccessRequestEmail
