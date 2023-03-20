import { render, waitFor } from '@testing-library/react'
import { CustomIcon } from '.'

describe('CustomIcon', () => {
  it('renders the circular progress on icon load', () => {
    const { getByRole } = render(<CustomIcon name="Like" />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders the outlined icon', async () => {
    const { queryByRole, getByTestId } = render(<CustomIcon name="Like" />)

    await waitFor(() => {
      expect(queryByRole('progressbar')).not.toBeInTheDocument()
      expect(getByTestId('LikeIcon')).toBeInTheDocument()
    })
  })

  // TODO: Update with solid icon once implemented
  it('renders the solid icon', async () => {
    const { queryByRole, getByText } = render(<CustomIcon name="Like" />)

    await waitFor(() => {
      expect(queryByRole('progressbar')).not.toBeInTheDocument()
      expect(getByText('LikeIconSolid')).toBeInTheDocument()
    })
  })
})
