import { render } from '@testing-library/react'

import { ActionsBanner } from './ActionsBanner'

describe('ActionsBanner', () => {
  it('should show actions banner', () => {
    const { getByText } = render(<ActionsBanner />)
    expect(getByText('Every Journey has a goal')).toBeInTheDocument()
    expect(
      getByText(
        'On this screen you will see all your goals and actions listed in a single table. Create cards with some actions like buttons. We will list all your links and actions here so you can:'
      )
    ).toBeInTheDocument()
  })
})
