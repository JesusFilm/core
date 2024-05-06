import { fireEvent, render } from '@testing-library/react'

import { ListGroup } from './ListGroup'

describe('ListGroup', () => {
  it('should show children in list group', () => {
    const { getByTestId } = render(
      <ListGroup name="group">
        <div>Child</div>
      </ListGroup>
    )
    fireEvent.click(getByTestId('ListGroupToggle'))
    expect(getByTestId('Collapse')).toHaveTextContent('Child')
  })
})
