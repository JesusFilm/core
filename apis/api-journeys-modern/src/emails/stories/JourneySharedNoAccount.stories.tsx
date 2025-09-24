import { Meta, StoryObj } from '@storybook/nextjs'

import { JourneyWithTeamAndUserJourney } from '../../workers/email/service/prisma.types'
import { JourneySharedNoAccountEmail } from '../templates/JourneyShared/JourneySharedNoAccount'

import { apiJourneysConfig } from './apiJourneysConfig'

const JourneySharedNoAccountEmailDemo: Meta<
  typeof JourneySharedNoAccountEmail
> = {
  ...apiJourneysConfig,
  component: JourneySharedNoAccountEmail,
  title: 'Api-Journeys/Emails/JourneySharedNoAccountEmail'
}

const Template: StoryObj<typeof JourneySharedNoAccountEmail> = {
  render: ({ ...args }) => (
    <JourneySharedNoAccountEmail
      journey={args.journey}
      inviteLink="https://admin.nextstep.is/journeys/journeyId"
      sender={args.sender}
      recipientEmail={args.recipientEmail}
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      title: 'Why Jesus?',
      team: {
        title: 'Ukrainian outreach team Odessa'
      },
      primaryImageBlock: {
        src: 'https://s3-alpha-sig.figma.com/img/772d/9819/02ebd5f068f6a3d437b4fc9f012a7102?Expires=1708905600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C6QXa0ycSXjPnW8H~f5fo49JwKf~aW~GMm8CSifCuWcCLDs-ft-h8Db9DNzIfaxlnYPNNJ2OzEzxcmYinmB~RL5CGYJQZUGKvu1YwoximgzXP~0vDbxYJ2Hrm~M9uQhIth2yHFZmDeBt1j6YtBmxpuAb89e1GYbOeOXqFF8gZqD74rL0nhwdw5vX3-J7LLd31bUOJhQ8CEdcZHNjQlqb3Twv3pxShAS0OIBlpwON8TLwKASKedYvz-3qwxNsr97AbyOocNFrmCXtVZv8Eqe6-qMatDnLrXRNBklQcLjK36tDzNx1SBv8-iBj~BasAva2FwQmu9aegkjlTP43eMbRLw__'
      }
    } as unknown as JourneyWithTeamAndUserJourney,
    sender: {
      firstName: 'Joe',
      email: 'ro-nimo@example.com',
      lastName: 'Ro-Nimo',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    },
    recipientEmail: 'someemail@example.com'
  }
}

export default JourneySharedNoAccountEmailDemo
