import { render, screen } from '@testing-library/react'

import { SaveButton } from './SaveButton'

describe('SaveButton', () => {
  it('should render save button as disabled', () => {
    render(<SaveButton disabled />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should render save button as not disabled', () => {
    render(<SaveButton disabled={false} />)

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
  })
})
