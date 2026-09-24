import { render } from '@testing-library/react'

import { UnpublishedVideoBanner } from './UnpublishedVideoBanner'

describe('UnpublishedVideoBanner', () => {
  it('should render an unpublished warning with an explanatory note', () => {
    const { getByText } = render(<UnpublishedVideoBanner />)

    expect(getByText('Unpublished')).toBeInTheDocument()
    expect(
      getByText(
        'This video has not been published yet. It can still be added to a journey, but visitors will not be able to watch it until it is published.'
      )
    ).toBeInTheDocument()
  })
})
