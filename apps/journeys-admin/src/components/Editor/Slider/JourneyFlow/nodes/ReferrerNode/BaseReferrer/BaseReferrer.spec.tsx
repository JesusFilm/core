import { render, screen } from '@testing-library/react'

import { BaseReferrer } from '.'

describe('BaseReferrer', () => {
  it('should render with default icon', () => {
    render(<BaseReferrer property="Direct / None" visitors={10} />)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('LinkAngledIcon')).toBeInTheDocument()
  })

  it('should render with other icon', () => {
    render(<BaseReferrer property="other sources" visitors={10} />)

    expect(screen.getByTestId('ChevronDownIcon')).toBeInTheDocument()
  })
})
