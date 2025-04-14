import { fireEvent, render, screen, within } from '@testing-library/react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'

import { OrderedItem } from './OrderedItem'

describe('OrderedItem', () => {
  it('should render', () => {
    render(<OrderedItem id="item.id" label="Ordered item" idx={0} />)

    expect(
      screen.getByRole('button', { name: 'ordered-item-drag-handle' })
    ).toBeInTheDocument()

    expect(screen.getByText('1. Ordered item')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItemDragHandle-0')).toBeInTheDocument()
  })

  it('should render menu with actions', async () => {
    const viewHandlerMock = jest.fn()

    render(
      <OrderedItem
        id="item.id"
        label="Ordered item"
        idx={0}
        menuActions={[{ label: 'View', handler: viewHandlerMock }]}
      />
    )

    const actions = screen.getByRole('button', { name: 'ordered-item-actions' })
    expect(actions).toBeInTheDocument()

    await fireEvent.click(actions)

    const actionMenu = screen.getByRole('menu', {
      name: 'ordered-item-actions-menu'
    })
    expect(actionMenu).toBeInTheDocument()

    const actionButton = within(actionMenu).getByRole('menuitem', {
      name: 'View'
    })
    expect(actionButton).toBeInTheDocument()

    fireEvent.click(actionButton)

    expect(viewHandlerMock).toHaveBeenCalledWith('item.id')
  })

  it('should render icon buttons', async () => {
    const viewOnClick = jest.fn()
    const editOnClick = jest.fn()

    render(
      <OrderedItem
        id="item.id"
        label="Ordered item"
        idx={0}
        iconButtons={[
          {
            Icon: EyeOpen,
            events: {
              onClick: viewOnClick
            },
            name: 'View'
          },
          {
            Icon: Edit2,
            events: {
              onClick: editOnClick
            },
            name: 'Edit'
          }
        ]}
      />
    )

    const viewButton = screen.getByTestId('EyeOpenIcon')
    const editButton = screen.getByTestId('Edit2Icon')

    fireEvent.click(editButton)
    expect(editOnClick).toHaveBeenCalled()
    fireEvent.click(viewButton)
    expect(viewOnClick).toHaveBeenCalled()
  })

  it('should render image', async () => {
    render(
      <OrderedItem
        id="item.id"
        label="Ordered item"
        idx={0}
        img={{
          src: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
          alt: 'JESUS'
        }}
      />
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg'
    )
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'JESUS')
  })
})
