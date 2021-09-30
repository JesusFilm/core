const nextImage = require('next/image')

Object.defineProperty(nextImage, 'default', {
  configurable: true,
  value: (props) => <img {...props} />
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
