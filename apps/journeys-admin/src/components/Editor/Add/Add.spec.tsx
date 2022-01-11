import { render, fireEvent } from '@testing-library/react'
import { EditorProvider } from '../Context'
import { Add } from '.'

describe('Add Button', () => {
  it('should render the button', () => {
    const { getByRole } = render(
      <EditorProvider>
        <Add />
      </EditorProvider>
    )

    const button = getByRole('button', { name: 'ADD' })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(button).not.toBeInTheDocument()
  })
})
