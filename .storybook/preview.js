const { createElement } = require('react')
const NextImage = require('next/legacy/image')
const {
  initialize: mswInitialize,
  mswDecorator
} = require('msw-storybook-addon')
const { MockedProvider } = require('@apollo/client/testing')

const OriginalNextImage = NextImage.default

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) =>
    createElement(OriginalNextImage, { ...props, unoptimized: true })
})

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

module.exports = {
  decorators: [mswDecorator],
  parameters: {
    backgrounds: {
      disable: true,
      grid: {
        disable: true
      }
    },
    chromatic: { viewports: [360, 1200] },
    controls: { disable: true },
    viewport: {
      viewports: customViewports
    },
    apolloClient: {
      MockedProvider
    }
  },
  globalTypes: {
    theme: {
      name: 'Theme Mode',
      description: 'Display mode for components',
      defaultValue: 'all',
      toolbar: {
        icon: 'mirror',
        items: ['light', 'dark', 'all']
      }
    }
  }
}
