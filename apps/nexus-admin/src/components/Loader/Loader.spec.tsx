import { render } from '@testing-library/react'

import { Loader } from './Loader'

describe('Loader', () => {
  it('displays a loader', async () => {
    const { getByRole } = render(<Loader />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
