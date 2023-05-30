import { render, waitFor } from '@testing-library/react'
import { CustomIcon } from './index'

describe('CustomIcon', () => {
  it('renders the circular progress on icon load', () => {
    const { getByRole } = render(<CustomIcon name="Like" />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders the icon', async () => {
    const { queryByRole, getByTestId } = render(<CustomIcon name="Like" />)

    await waitFor(() => {
      expect(queryByRole('progressbar')).not.toBeInTheDocument()
      expect(getByTestId('LikeIcon')).toBeInTheDocument()
    })
  })
})
