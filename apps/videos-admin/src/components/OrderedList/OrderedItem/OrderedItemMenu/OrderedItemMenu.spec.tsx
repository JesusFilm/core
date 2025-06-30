import { fireEvent, render, screen } from '@testing-library/react'

import { OrderedItemMenu } from './OrderedItemMenu'

describe('OrderedItemMenu', () => {
  it('should call onClick events', () => {
    const editOnClick = jest.fn()
    render(
      <OrderedItemMenu
        id="someId"
        actions={[{ label: 'Edit', handler: editOnClick }]}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('menuitem'))
    expect(editOnClick).toHaveBeenCalled()
  })
})
