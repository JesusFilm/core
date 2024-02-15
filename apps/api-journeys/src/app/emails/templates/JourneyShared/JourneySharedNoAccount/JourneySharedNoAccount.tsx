import { Body, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { ReactElement, ReactNode } from 'react'

import { JourneyFields } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import {
  ActionCard,
  BodyWrapper,
  EmailContainer,
  Footer,
  Header,
  UnsubscribeLink
} from '@core/nest/common/email/components'
import { User } from '@core/nest/common/firebaseClient'

import { JourneyWithTeamAndUserJourney } from '../../../../modules/email/email.consumer'

interface JourneySharedNoAccountEmailProps {
  journey: JourneyWithTeamAndUserJourney
  inviteLink: string
  sender: Omit<User, 'id' | 'emailVerified'>
  story?: boolean
  recipientEmail: string
}

interface WrapperProps {
  children: ReactElement
}

export const JourneySharedNoAccountEmail = ({
  journey,
  inviteLink,
  recipientEmail,
  sender,
  story = false
}: JourneySharedNoAccountEmailProps): ReactElement => {
  const previewText = `${journey.title} has been shared with you on NextSteps`
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
            headerText="journey shared with you!"
            buttonText="View Journey"
            variant="sharedWithYou"
            sender={sender}
            journey={journey as unknown as JourneyFields}
          />
        </BodyWrapper>
        <Footer />
        <UnsubscribeLink recipientEmail={recipientEmail} />
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

JourneySharedNoAccountEmail.PreviewProps = {
  journey: {
    title: 'Why Jesus?',
    team: {
      title: 'Ukrainian outreach team Odessa'
    },
    primaryImageBlock: {
      src: 'https://s3-alpha-sig.figma.com/img/772d/9819/02ebd5f068f6a3d437b4fc9f012a7102?Expires=1708905600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C6QXa0ycSXjPnW8H~f5fo49JwKf~aW~GMm8CSifCuWcCLDs-ft-h8Db9DNzIfaxlnYPNNJ2OzEzxcmYinmB~RL5CGYJQZUGKvu1YwoximgzXP~0vDbxYJ2Hrm~M9uQhIth2yHFZmDeBt1j6YtBmxpuAb89e1GYbOeOXqFF8gZqD74rL0nhwdw5vX3-J7LLd31bUOJhQ8CEdcZHNjQlqb3Twv3pxShAS0OIBlpwON8TLwKASKedYvz-3qwxNsr97AbyOocNFrmCXtVZv8Eqe6-qMatDnLrXRNBklQcLjK36tDzNx1SBv8-iBj~BasAva2FwQmu9aegkjlTP43eMbRLw__'
    }
  } as unknown as JourneyWithTeamAndUserJourney,
  inviteLink:
    'https://admin.nextstep.is/journeys/dd2520c8-2f59-4ce2-89e5-92124647b4ff',
  sender: {
    firstName: 'Joe',
    email: 'ronImo@example.com',
    lastName: 'Ron-Imo',
    imageUrl:
      'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  recipientEmail: 'someemail@example.com'
} satisfies JourneySharedNoAccountEmailProps

export default JourneySharedNoAccountEmail
