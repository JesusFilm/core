import { Provider } from 'react-redux'
import { configureStoreWithState, RootState } from '../store/store'
import { PreloadedState } from 'redux'
import { parameters as rootParameters } from '../../../../../.storybook/preview'

let preloadedState: PreloadedState<RootState>

// Must set parameters at component level for share-library stories to work
export const journeysConfig = {
  decorators: [
    Story => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story/>
      </Provider>
    )
  ],
  parameters: {
    ...rootParameters
  }
}
