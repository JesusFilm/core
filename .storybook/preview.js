import { initialize as mswInitialize, mswLoader } from 'msw-storybook-addon'
import { MockedProvider } from '@apollo/client/testing'
import 'swiper/css'
import 'swiper/css/a11y'
import 'swiper/css/mousewheel'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const customViewports = {
  mobileMin: {
    name: 'Small Mobile',
    styles: {
      width: '360px',
      height: '640px'
    },
    type: 'mobile'
  },
  mobileMax: {
    name: 'Large Mobile',
    styles: {
      width: '540px',
      height: '960px'
    },
    type: 'mobile'
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px'
    },
    type: 'tablet'
  }
}

mswInitialize({
  onUnhandledRequest: 'bypass'
})

export const parameters = {
  backgrounds: {
    grid: {
      disable: true
    },
    disabled: true
  },
  chromatic: { viewports: [360, 1200] },
  controls: { disable: true },
  viewport: {
    options: customViewports
  },
  apolloClient: {
    MockedProvider
  }
}

export const globalTypes = {
  theme: {
    name: 'Theme Mode',
    description: 'Display mode for components',
    toolbar: {
      title: 'Theme Mode',
      icon: 'mirror',
      items: ['light', 'dark', 'all']
    }
  }
}

export const initialGlobals = {
  theme: 'all'
}

export default {
  loaders: [mswLoader],
  parameters,
  globalTypes,
  initialGlobals,
  tags: ['autodocs']
}
