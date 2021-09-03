import { Provider } from 'react-redux'
import { configureStoreWithState, RootState } from '../store/store'
import { PreloadedState } from 'redux'

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
    chromatic: { viewports: [320] }
  }
}
