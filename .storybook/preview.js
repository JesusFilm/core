const { createElement } = require('react')
const NextImage = require('next/image')

const OriginalNextImage = NextImage.default

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) =>
    createElement(OriginalNextImage, { ...props, unoptimized: true })
})

module.exports = {
  parameters: {
    chromatic: { viewports: [640] },
    controls: { disabled: true },
    backgrounds: {
      disable: true,
      grid: {
        disable: true
      }
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
