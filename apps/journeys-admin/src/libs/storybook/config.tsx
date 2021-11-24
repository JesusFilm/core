import { sharedUiConfig } from '@core/shared/ui'

// Must set parameters at component level for shared-storybook stories to work
export const journeysAdminConfig = {
  ...sharedUiConfig
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  parameters: {
    ...journeysAdminConfig.parameters,
    chromatic: {
      ...journeysAdminConfig.parameters.chromatic,
      viewports: [1200]
    }
  }
}
