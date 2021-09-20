import * as nextImage from 'next/image'
import * as React from 'react';

Object.defineProperty(nextImage, 'default', {
  configurable: true,
  value: props => <img {...props} />
});

export const parameters = {
  chromatic: { viewports: [320] },
  controls: { disabled: true },
  backgrounds: {
    grid: {
      disable: true
    }
  }
}
