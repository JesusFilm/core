import { render } from '@testing-library/react'

import { NextImage } from '.'

describe('NextImage', () => {
  it('renders the NextImage', async () => {
    const { getByRole } = render(
      <NextImage
        src="https://srcUrl"
        alt="alt"
        placeholder="blur"
        blurDataURL="https://blurUrl"
        fill
        style={{
          objectFit: 'cover'
        }}
      />
    )
    expect(getByRole('img')).toHaveAttribute('srcset')
    expect(getByRole('img')).toHaveAccessibleName('alt')
  })
})
