import { render } from '@testing-library/react'

import { SeeAllVideos } from './SeeAllVideos'

describe('SeeAllVideos', () => {
  it('button should have correct link', () => {
    const { getByTestId } = render(<SeeAllVideos />)
    expect(getByTestId('SeeAllVideos')).toHaveAttribute('href', '/videos')
  })
})
