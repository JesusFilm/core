import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { OrderedItem } from "./OrderedItem"

describe('OrderedItem', () => {
  const updateOrderMock = jest.fn()

  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <OrderedItem id='item.id' label="Ordered item" idx={0} total={1} onOrderUpdate={updateOrderMock} />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('button', { name: 'ordered-item-drag-handle'})).toBeInTheDocument()

    const orderSelect = screen.getByRole('combobox')

    expect(screen.getByText('Ordered item')).toBeInTheDocument()
    expect(orderSelect).toBeInTheDocument()
    expect(orderSelect).toHaveTextContent('1')
  })

  it('should emit update event', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <OrderedItem id='item.id' label="Ordered item" idx={0} total={2} onOrderUpdate={updateOrderMock} />
      </NextIntlClientProvider>
    )
    const orderSelect = screen.getByRole('combobox')

    await fireEvent.mouseDown(orderSelect)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = within(listbox).getAllByRole('option')

    expect(options.length).toBe(2)
    expect(options[0]).toHaveAttribute('aria-selected', "true")
    expect(options[1]).toHaveAttribute('aria-selected', "false")

    fireEvent.click(options[1])
    expect(updateOrderMock).toHaveBeenCalledWith({ id: 'item.id', order: 2})
  })

  it('should render actions', async () => {
    const viewHandlerMock = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <OrderedItem id='item.id' label="Ordered item" idx={0} total={1} onOrderUpdate={updateOrderMock} actions={[
          { label: 'View', handler: viewHandlerMock }
        ]}/>
      </NextIntlClientProvider>
    )

    const actions = screen.getByRole('button', { name: 'ordered-item-actions' })
    expect(actions).toBeInTheDocument()

    await fireEvent.click(actions)

    const actionMenu = screen.getByRole('menu', { name: 'ordered-item-actions-menu'})
    expect(actionMenu).toBeInTheDocument()

    const actionButton = within(actionMenu).getByRole('menuitem', { name: 'View' })
    expect(actionButton).toBeInTheDocument()

    fireEvent.click(actionButton)

    expect(viewHandlerMock).toHaveBeenCalledWith('item.id')
  })
})