import { sharedUiConfig } from '@core/shared/ui'

// Must set parameters at component level for shared-storybook stories to work
export const journeyAdminConfig = {
  ...sharedUiConfig
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  parameters: {
    ...journeyAdminConfig.parameters,
    chromatic: {
      ...journeyAdminConfig.parameters.chromatic,
      viewports: [1200]
    }
  }
}
