import { render } from '@testing-library/react'

import { EditionView } from './EditionView'

const mockEdition = {
  id: 'edition.id',
  name: 'Edition 1'
}

describe('EditionView', () => {
  it('should render', () => {
    render(<EditionView edition={mockEdition} />)
  })
})
