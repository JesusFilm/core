import { sharedUiConfig } from '@core/shared/ui'

// Must set parameters at component level for shared-storybook stories to work
export const journeyUiConfig = {
  ...sharedUiConfig
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  parameters: {
    ...journeyUiConfig.parameters,
    chromatic: {
      ...journeyUiConfig.parameters?.chromatic,
      viewports: [600]
    }
  }
}
