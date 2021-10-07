import { Story, StoryContext } from '@storybook/react'

import { parameters as rootParameters } from '../../../../../../.storybook/preview'
import { ThemeDecorator } from './decorators'

// Must set parameters at component level for shared-storybook stories to work
export const sharedUiConfig = {
  decorators: [
    (Story: Story, context: StoryContext) => {
      console.log(context.chromatic)
      return (
        <ThemeDecorator mode={context.globals.theme}>
          <Story />
        </ThemeDecorator>
      )
    }
  ],
  parameters: {
    ...rootParameters
  }
}
