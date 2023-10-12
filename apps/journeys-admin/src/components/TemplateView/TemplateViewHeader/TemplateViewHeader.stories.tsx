import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../libs/storybook'
import { journey } from '../../Editor/ActionDetails/data'

import { TemplateViewHeader } from './TemplateViewHeader'

const TemplateViewHeaderStory: Meta<typeof TemplateViewHeader> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/TemplateView/TemplateHeader',
  component: TemplateViewHeader
}

const Template: StoryObj<typeof TemplateViewHeaderStory> = {
  render: ({ ...args }) => (
    <JourneyProvider
      value={{
        journey
      }}
    >
      <TemplateViewHeader
        isPublisher={args.isPublisher}
        authUser={args.authUser}
      />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    isPublisher: false,
    authUser: { id: 'userId' }
  }
}

export const Publisher = {
  ...Template,
  args: {
    isPublisher: true,
    authUser: { id: 'userId' }
  }
}

export const Public = {
  ...Template,
  args: {
    isPublisher: false,
    authUser: {}
  }
}

export default TemplateViewHeaderStory
