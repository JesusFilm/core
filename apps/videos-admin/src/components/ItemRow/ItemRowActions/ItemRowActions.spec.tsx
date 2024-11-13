import { render, screen } from '@testing-library/react'
import { ItemRowActions } from './ItemRowActions'

import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import userEvent from '@testing-library/user-event'

describe('ItemRowActions', () => {
  const mockView = jest.fn()

  it('should render', () => {
    render(<ItemRowActions actions={[{ handler: mockView, Icon: EyeOpen }]} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByTestId('EyeOpenIcon')).toBeInTheDocument()
  })

  it('should emit callback for action button', async () => {
    render(<ItemRowActions actions={[{ handler: mockView, Icon: EyeOpen }]} />)

    const button = screen.getByRole('button')

    await userEvent.click(button)

    expect(mockView).toHaveBeenCalled()
  })
})
