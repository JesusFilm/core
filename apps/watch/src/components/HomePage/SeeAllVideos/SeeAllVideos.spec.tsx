import { render } from '@testing-library/react'

import { SeeAllVideos } from './SeeAllVideos'

describe('SeeAllVideos', () => {
  it('button should have correct link', () => {
    const { getByLabelText } = render(<SeeAllVideos />)
    expect(getByLabelText('all-videos-button')).toHaveAttribute(
      'href',
      '/videos'
    )
  })
})
