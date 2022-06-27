import { Story, StoryContext } from '@storybook/react'
import { parameters as rootParameters } from '../../../../../../.storybook/preview'
import { ThemeDecorator } from '../../components/ThemeDecorator'

// Must set parameters at component level for shared-storybook stories to work
export const sharedUiConfig = {
  decorators: [
    (Story: Story, context: StoryContext) => (
      <ThemeDecorator
        mode={context.parameters.theme ?? context.globals.theme}
        layout={context.parameters.layout}
      >
        <Story />
      </ThemeDecorator>
    )
  ],
  parameters: {
    ...rootParameters
  }
}
