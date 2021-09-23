import { parameters as rootParameters } from '../../../../../.storybook/preview'

// Must set parameters at component level for shared-storybook stories to work
export const journeysConfig = {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  decorators: [(Story: () => unknown) => Story()],
  parameters: {
    ...rootParameters
  }
}
