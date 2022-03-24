import { sharedUiConfig } from '@core/shared/ui'

// Must set parameters at component level for shared-storybook stories to work
export const watchConfig = {
  ...sharedUiConfig
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  parameters: {
    ...watchConfig.parameters,
    chromatic: {
      ...watchConfig.parameters.chromatic,
      viewports: [600]
    }
  }
}
