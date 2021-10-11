import { Story, StoryContext } from '@storybook/react'

import { parameters as rootParameters } from '../../../../../../.storybook/preview'
import { ThemeDecorator } from './decorators'

// Must set parameters at component level for shared-storybook stories to work
export const sharedUiConfig = {
  decorators: [
    (Story: Story, context: StoryContext) => {
      console.log(context)
      return (
        <ThemeDecorator
          mode={context.globals.theme}
          layout={context.parameters.layout}
        >
          <Story />
        </ThemeDecorator>
      )
    }
  ],
  parameters: {
    ...rootParameters
    // TODO: Currently app background and card background are same color, update background if this needs changing
  }
}
