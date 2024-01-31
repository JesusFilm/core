import { Decorator, StoryContext } from '@storybook/react'

// eslint-disable-next-line @nx/enforce-module-boundaries
import { parameters as rootParameters } from '../../../../../../.storybook/preview'

// Must set parameters at component level for shared-storybook stories to work
export const apiJourneysConfig = {
  decorators: [
    (Story: Parameters<Decorator>[0], context: StoryContext) => <Story />
  ],
  parameters: {
    ...rootParameters
  }
}
