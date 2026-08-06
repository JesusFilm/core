import { journeyUiConfig } from '../journeyUiConfig'

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  ...journeyUiConfig,
  parameters: {
    ...journeyUiConfig.parameters,
    chromatic: {
      ...journeyUiConfig.parameters?.chromatic,
      viewports: [600]
    }
  }
}
