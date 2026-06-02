import { fireEvent, render, screen } from '@testing-library/react'

import { NotificationPopover } from '.'

describe('NotificationPopover', () => {
  it('should render', () => {
    render(
      <NotificationPopover
        title="title"
        description="description"
        open
        currentRef={(<div>hello world</div>) as unknown as HTMLElement}
        pointerPosition="10%"
        handleClose={vi.fn()}
      />
    )

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('should close popover', () => {
    const handleClose = vi.fn()

    render(
      <NotificationPopover
        title="title"
        description="description"
        open
        currentRef={(<div>hello world</div>) as unknown as HTMLElement}
        pointerPosition="10%"
        handleClose={handleClose}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should show popover action', () => {
    const handleClose = vi.fn()
    const handleAction = vi.fn()

    render(
      <NotificationPopover
        title="title"
        description="description"
        open
        currentRef={(<div>hello world</div>) as unknown as HTMLElement}
        pointerPosition="10%"
        handleClose={handleClose}
        popoverAction={{
          label: 'Action',
          handleClick: handleAction
        }}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    expect(handleClose).toHaveBeenCalled()
    expect(handleAction).toHaveBeenCalled()
  })
})
