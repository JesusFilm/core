const NextImage = require('next/image')

const OriginalNextImage = NextImage.default

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />
})

module.exports = {
  parameters: {
    chromatic: { viewports: [320] },
    controls: { disabled: true },
    backgrounds: {
      grid: {
        disable: true
      }
    },
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}
