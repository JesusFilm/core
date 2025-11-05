import { Meta, StoryObj } from '@storybook/nextjs'

import { Journey } from '../../workers/email/service/prisma.types'
import { JourneyAccessRequestEmail } from '../templates/JourneyAccessRequest'

import { apiJourneysConfig } from './apiJourneysConfig'

const JourneyAccessRequestEmailDemo: Meta<typeof JourneyAccessRequestEmail> = {
  ...apiJourneysConfig,
  component: JourneyAccessRequestEmail,
  title: 'Api-Journeys/Emails/JourneyAccessRequestEmail'
}

const Template: StoryObj<typeof JourneyAccessRequestEmail> = {
  render: ({ ...args }) => (
    <JourneyAccessRequestEmail
      journey={args.journey}
      recipient={args.recipient}
      inviteLink="https://admin.nextstep.is/journeys/journeyId"
      sender={args.sender}
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
  }
}

export default JourneyAccessRequestEmailDemo
