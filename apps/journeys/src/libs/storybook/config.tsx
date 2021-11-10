import { sharedUiConfig } from '@core/shared/ui'

// Must set parameters at component level for shared-storybook stories to work
export const journeysConfig = {
  ...sharedUiConfig
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  parameters: {
    ...journeysConfig.parameters,
    chromatic: {
      ...journeysConfig.parameters.chromatic,
      viewports: [600]
    }
  }
}
