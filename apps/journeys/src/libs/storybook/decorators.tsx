import { parameters as rootParameters } from '../../../../../.storybook/preview'

// Must set parameters at component level for share-library stories to work
export const journeysConfig = {
  decorators: [
    Story => (
      <Story/>
    )
  ],
  parameters: {
    ...rootParameters
  }
}
