import { sharedUiConfig } from '../sharedUiConfig'

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  ...sharedUiConfig,
  parameters: {
    ...sharedUiConfig.parameters,
    chromatic: {
      ...sharedUiConfig.parameters?.chromatic,
      viewports: [600]
    }
  }
}
