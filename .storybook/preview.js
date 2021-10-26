const { createElement } = require('react')
const NextImage = require('next/image')

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
      width: '320px',
      height: '568px'
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

module.exports = {
  parameters: {
    backgrounds: {
      disable: true,
      grid: {
        disable: true
      }
    },
    // 2x viewport breakpoints (XS, SM, MD) Largest out of bounds for Chromatic.
    // TODO: Split out light / dark mode tests during Cooldown
    chromatic: { viewports: [640, 1136, 1200] },
    controls: { disabled: true },
    viewport: {
      viewports: customViewports
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
